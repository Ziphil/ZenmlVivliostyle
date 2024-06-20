//

import {ChildrenArgs, Nodes, ZenmlAttributes, ZenmlMarks, ZenmlParser, ZenmlPlugin, ZenmlPluginManager} from "@zenml/zenml";
import fs from "fs";
import type {Parser} from "parsimmon";


export class ImportZenmlPlugin implements ZenmlPlugin {

  private zenmlParser!: ZenmlParser;

  public constructor() { }

  public initialize(zenmlParser: ZenmlParser): void {
    this.zenmlParser = zenmlParser;
  }

  public updateDocument(document: Document): void {
  }

  public getParser(): Parser<Nodes> {
    return this.zenmlParser.nodes({});
  }

  public createElement(tagName: string, marks: ZenmlMarks, attributes: ZenmlAttributes, childrenArgs: ChildrenArgs): Nodes {
    const path = attributes.get("src");
    if (path !== undefined) {
      const string = fs.readFileSync(path, "utf-8");
      const document = this.zenmlParser.parse(string);
      const nodes = [];
      for (let i = 0 ; i < document.childNodes.length ; i ++) {
        nodes.push(document.childNodes.item(i)!);
      }
      return nodes;
    } else {
      return [];
    }
  }

}


const manager = new ZenmlPluginManager();

manager.registerPlugin("import", new ImportZenmlPlugin());

export default manager;