    export function Honorific({num}) {
        if (num === 0) return "Complacent Sitter";
        if (num <= 5) return "Occasional Sitter";
        if (num <= 15) return "Regular Sitter";
        if (num <= 50) return "Constantly Sitting";
        if (num <= 100) return "Super Bench Sitter";
        if (num <= 250) return "Ultra Bench Sitter";
        return "BENCH";
    }