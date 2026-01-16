const wordProblems = [
    { q: "Ship has 4 fuel cells but needs 12 for Saturn. How many more?", a: "8" },
    { q: "Radar shows 18 UFOs. 9 are debris. Actual UFOs?", a: "9" },
    { q: "Alien has 3 eyes. Group of 9 aliens has how many eyes?", a: "27" },
    { q: "An asteroid belt has 15 rocks. You blasted 7. How many are left?", a: "8" },
    { q: "The space station has 3 docking bays. Each bay holds 5 ships. Total?", a: "15" },
    { q: "Black hole pulls in 2 stars every hour. Gone in 6 hours?", a: "12" },
    { q: "Ship travels 10 light-years per jump. Made 4 jumps. Total?", a: "40" },
    { q: "Found 20 crystals, shared with 4 crew mates. Each gets?", a: "5" },
    { q: "Saturn has 82 moons. Jupiter has 95. Difference?", a: "13" },
    { q: "Comet tail is 500 miles. 200 miles melted. Length?", a: "300" },
    { q: "Have 3 oxygen tanks. Each lasts 8 minutes. Total air?", a: "24" },
    { q: "Need 100% battery to warp. Have 65%. Need more?", a: "35" },
    { q: "Planet has 2 suns. Visit 7 planets, total suns?", a: "14" },
    { q: "Cargo hold fits 50 crates. You have 32. Space left?", a: "18" },
    { q: "Signal takes 4 mins to reach Earth. 5 signals take?", a: "20" }
];

const generateMath = () => {
    let math = [];
    for (let i = 0; i < 185; i++) {
        let a = Math.floor(Math.random() * 20);
        let b = Math.floor(Math.random() * 20);
        math.push({ q: `${a} + ${b} = ?`, a: (a + b).toString() });
    }
    return math;
};

export const questionBank = [...wordProblems, ...generateMath()];
