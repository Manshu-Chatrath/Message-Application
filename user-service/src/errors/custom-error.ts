export abstract class CustomError extends Error {
    abstract statusCode: number; //abstract methods must be define in the derived classs
    constructor(message: string) {
        super(message);
    }
    abstract serializeMethodErrors(): {message: any, statusCode: number}
}