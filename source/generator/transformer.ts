//

import {BaseTransformer, LightTransformer, NodeLikeOf, TemplateManager} from "@zenml/zenml";
import dotjs from "dot";
import TEMPLATE_HTML from "../resource/template.html";
import type {VivliostyleDocument} from "./dom";


export class VivliostyleTransformer extends BaseTransformer<VivliostyleDocument, VivliostyleTransformerEnvironments, VivliostyleTransformerVariables> {

  private template: (...args: Array<any>) => string;

  public constructor(implementation: () => VivliostyleDocument) {
    super(implementation);
    this.template = dotjs.template(TEMPLATE_HTML, {...dotjs.templateSettings, strip: false});
  }

  protected stringify(document: VivliostyleDocument): string {
    const view = {
      environments: this.environments,
      variables: this.variables,
      document
    };
    const output = this.template(view);
    return output;
  }

  protected resetEnvironments(initialEnvironments?: Partial<VivliostyleTransformerEnvironments>): void {
    this.environments = {...initialEnvironments};
  }

  protected resetVariables(initialVariables?: Partial<VivliostyleTransformerVariables>): void {
    this.variables = {...initialVariables};
  }

}


export class VivliostyleTemplateManager extends TemplateManager<VivliostyleDocument, VivliostyleTransformerEnvironments, VivliostyleTransformerVariables> {

}


export type VivliostyleLightTransformer = LightTransformer<VivliostyleDocument, VivliostyleTransformerEnvironments, VivliostyleTransformerVariables>;

export type VivliostyleTransformerEnvironments = {
};
export type VivliostyleTransformerVariables = {
  headerNode?: NodeLikeOf<VivliostyleDocument>
};