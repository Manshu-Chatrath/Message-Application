const bcrypt = require('bcrypt');
export class PasswordService {
    password: string;
    constructor(password: string) {
        this.password = password;
    }

    static async hash(password: string) {
        const cryptedPassword = await bcrypt.hash(password, 10);            
        return cryptedPassword;
    }

    static async checkPassword(password: string, realPassword: string)  {
        const result = await bcrypt.compare(password, realPassword);
        return result;
    }
}