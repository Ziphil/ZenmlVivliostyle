//

import {BaseDocument, BaseDocumentFragment, BaseElement, BaseText} from "@zenml/zenml";


export class VivliostyleElement extends BaseElement<VivliostyleDocument, VivliostyleDocumentFragment, VivliostyleElement, VivliostyleText> {

  public addClassName(className: string): void {
    const currentClassName = this.attributes.get("class");
    const nextClassName = (currentClassName) ? currentClassName + " " + className : className;
    this.attributes.set("class", nextClassName);
  }

}


export class VivliostyleDocument extends BaseDocument<VivliostyleDocument, VivliostyleDocumentFragment, VivliostyleElement, VivliostyleText> {

  protected prepareDocumentFragment(): VivliostyleDocumentFragment {
    return new VivliostyleDocumentFragment(this);
  }

  protected prepareElement(tagName: string): VivliostyleElement {
    return new VivliostyleElement(this, tagName);
  }

  protected prepareTextNode(content: string): VivliostyleText {
    return new VivliostyleText(this, content);
  }

}


export class VivliostyleDocumentFragment extends BaseDocumentFragment<VivliostyleDocument, VivliostyleDocumentFragment, VivliostyleElement, VivliostyleText> {

}


export class VivliostyleText extends BaseText<VivliostyleDocument, VivliostyleDocumentFragment, VivliostyleElement, VivliostyleText> {

}