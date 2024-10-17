export class Errors extends Error {
    constructor(message, location) {
        super(message);
        this.row = location.end.line
        this.column = location.end.column
        this.type = 'Semantic'
    }
    


}