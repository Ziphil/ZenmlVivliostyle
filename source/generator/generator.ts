//

import {DOMImplementation} from "@zenml/xmldom";
import {ZenmlParser, ZenmlPluginManager, measureAsync} from "@zenml/zenml";
import chalk from "chalk";
import {exec} from "child_process";
import chokidar from "chokidar";
import commandLineArgs from "command-line-args";
import fs from "fs/promises";
import pathUtil from "path";
import sass from "sass";
import {SourceSpan as SassSourceSpan} from "sass";
import {VivliostyleDocument} from "./dom";
import {VivliostyleTemplateManager, VivliostyleTransformer} from "./transformer";


export class VivliostyleGenerator {

  private parser!: ZenmlParser;
  private transformer!: VivliostyleTransformer;
  private configs!: VivliostyleConfigs;
  private options!: any;

  public constructor(configs: VivliostyleConfigs) {
    this.configs = configs;
  }

  public async execute(): Promise<void> {
    const options = commandLineArgs([
      {name: "watch", alias: "w", type: Boolean},
      {name: "view", alias: "v", type: Boolean}
    ]);
    this.parser = this.createParser();
    this.transformer = this.createTransformer();
    this.options = options;
    if (options.watch) {
      await this.executeWatch();
    } if (options.view) {
      await this.executeView();
    } else {
      await this.executeNormal();
    }
  }

  private async executeNormal(): Promise<void> {
    const documentPaths = await this.getDocumentPaths();
    await Promise.all(documentPaths.map(async (documentPath) => {
      await this.saveNormal(documentPath);
    }));
  }

  private async executeWatch(): Promise<void> {
    const documentPaths = await this.getDocumentPaths();
    await new Promise((resolve, reject) => {
      const watcher = chokidar.watch(documentPaths, {persistent: true, ignoreInitial: true});
      watcher.on("change", (documentPath) => {
        this.saveNormal(documentPath);
      });
      watcher.on("error", (error) => {
        reject(error);
      });
    });
  }

  private async executeView(): Promise<void> {
    const outputPath = pathUtil.join(this.configs.outputDirPath, "manuscript.html");
    await new Promise<void>((resolve, reject) => {
      exec(`vivliostyle preview ${outputPath}`, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  private async saveNormal(documentPath: string): Promise<void> {
    const intervals = {convert: 0};
    try {
      intervals.convert = await measureAsync(async () => {
        await this.transformNormal(documentPath);
      });
      this.printNormal(documentPath, intervals, true);
    } catch (error) {
      this.printNormal(documentPath, intervals, false);
      await this.logError(documentPath, error);
    }
  }

  private async transformNormal(documentPath: string): Promise<void> {
    const extension = pathUtil.extname(documentPath).slice(1);
    const outputPaths = this.getOutputPaths(documentPath);
    const promises = outputPaths.map(async (outputPath) => {
      if (extension === "zml") {
        await this.transformNormalZml(documentPath, outputPath);
      } else if (extension === "scss") {
        await this.transformNormalScss(documentPath, outputPath);
      }
    });
    await Promise.all(promises);
  }

  private async transformNormalZml(documentPath: string, outputPath: string): Promise<void> {
    const inputString = await fs.readFile(documentPath, {encoding: "utf-8"});
    const inputDocument = this.parser.tryParse(inputString);
    const outputString = this.transformer.transformStringify(inputDocument);
    await fs.mkdir(pathUtil.dirname(outputPath), {recursive: true});
    await fs.writeFile(outputPath, outputString, {encoding: "utf-8"});
  }

  private async transformNormalScss(documentPath: string, outputPath: string): Promise<void> {
    const logMessage = function (message: string, options: {span?: SassSourceSpan}): void {
      Function.prototype();
    };
    const options = {
      file: documentPath,
      logger: {debug: logMessage, warn: logMessage}
    };
    const outputString = sass.renderSync(options).css.toString("utf-8");
    await fs.mkdir(pathUtil.dirname(outputPath), {recursive: true});
    await fs.writeFile(outputPath, outputString, {encoding: "utf-8"});
  }

  private printNormal(documentPath: string, intervals: {convert: number}, succeed: boolean): void {
    let output = "";
    output += " ";
    output += chalk.cyan(Math.min(intervals.convert, 9999).toString().padStart(4));
    output += chalk.cyan(" ms");
    output += "  |  ";
    if (succeed) {
      output += chalk.yellow(documentPath);
    } else {
      output += chalk.bgYellow.black(documentPath);
    }
    console.log(output);
  }

  private async logError(documentPath: string, error: unknown): Promise<void> {
    let output = "";
    const logPath = this.configs.errorLogPath;
    output += `[${documentPath}]` + "\n";
    if (error instanceof Error) {
      output += error.message.trim() + "\n";
      output += (error.stack ?? "").trim() + "\n";
    } else {
      output += ("" + error).trim() + "\n";
    }
    output += "\n";
    await fs.appendFile(logPath, output, {encoding: "utf-8"});
  }

  protected createParser(): ZenmlParser {
    const implementation = new DOMImplementation();
    const parser = new ZenmlParser(implementation, {specialElementNames: {brace: "x", bracket: "xn", slash: "i"}});
    for (const manager of this.configs.pluginManagers ?? []) {
      parser.registerPluginManager(manager);
    }
    return parser;
  }

  protected createTransformer(): VivliostyleTransformer {
    const transformer = new VivliostyleTransformer(() => new VivliostyleDocument({includeDeclaration: false, html: true}));
    for (const manager of this.configs.templateManagers ?? []) {
      transformer.regsiterTemplateManager(manager);
    }
    return transformer;
  }

  private async getDocumentPaths(): Promise<Array<string>> {
    const documentPaths = [this.configs.manuscriptPath, this.configs.stylePath];
    return documentPaths;
  }

  private getOutputPaths(documentPath: string): Array<string> {
    if (documentPath.match(/\.zml$/)) {
      const outputPath = pathUtil.join(this.configs.outputDirPath, "manuscript.html");
      return [outputPath];
    } else if (documentPath.match(/\.scss$/)) {
      const outputPath = pathUtil.join(this.configs.outputDirPath, "style.css");
      return [outputPath];
    } else {
      return [];
    }
  }

}


export type VivliostyleConfigs = {
  pluginManagers?: Array<ZenmlPluginManager>,
  templateManagers?: Array<VivliostyleTemplateManager>,
  manuscriptPath: string,
  stylePath: string,
  outputDirPath: string,
  errorLogPath: string
};

