import { CustomError } from "./custom-error";

export class BadRequestError extends CustomError {
    statusCode = 400;

    constructor(message: string) {
        super(message);
    }

    serializeMethodErrors() {
            return {statusCode: this.statusCode, message: this.message}
    }
}