import '../Components/components.css'

// A title granted to a user based off of the number of reviews they have
    export function Honorific(num) {
        if (num === 0)   return { tag: "Complacent Sitter ",   className: "honorific1" };
        if (num <= 5)   return { tag: "Occasional Sitter",   className: "honorific2" };
        if (num <= 15)  return { tag: "Regular Sitter",      className: "honorific3" };
        if (num <= 50)  return { tag: "Constantly Sitting",  className: "honorific4" };
        if (num <= 100) return { tag: "Super Bench Sitter",  className: "honorific5" };
        if (num <= 250) return { tag: "Ultra Bench Sitter",  className: "honorific6" };
        return { tag: "🐈🐈🐈BENCH🐈🐈🐈", className: "honorific7"};
    }
