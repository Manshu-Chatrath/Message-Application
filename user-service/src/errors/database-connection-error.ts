import { CustomError } from "./custom-error";

export class DataBaseConnectionError extends CustomError {
    
    statusCode = 500;

    constructor(message: string) {
        super(message);
    }

    serializeMethodErrors() {
        return {statusCode: this.statusCode, message: this.message}
    }
}