import { Logger } from "@nestjs/common";

export class BaseController {
  context: string
  currentMethod: string;

  logger: Logger

  constructor(context: string) {
    this.context = context

    this.logger = new Logger(context)
  }
}

export function annotateName(target, name, desc) {
  var method = desc.value;
  desc.value = function () {
    var prevMethod = this.currentMethod;
    this.currentMethod = name;
    method.apply(this, arguments);
    this.currentMethod = prevMethod;
  }
}