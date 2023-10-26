import { CustomError } from "./custom-error";

export class RequestValidationError extends CustomError {
    
    statusCode = 400;
  
    constructor(message: string) {
        super(message)
    }

    serializeMethodErrors(): { message: any; statusCode: number; } {
        return {message: this.message, statusCode: this.statusCode}
    }
}