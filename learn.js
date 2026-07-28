const users = [
    {
        id: 1,
        name: "Alex",
        skills: ["JS", "Node", "SQL"]
    },
    {
        id: 2,
        name: "Ivan",
        skills: ["Python", "Docker"]
    },
    {
        id: 3,
        name: "Maria",
        skills: ["Node", "React"]
    }
];
// получить все навыки
["JS", "Node", "SQL", "Python", "Docker", "Node", "React"]
const getAllSkils = (users) => {
    const box = [];
    for(const u of users){
        for(s of u.skills){
            box.push(s);
        }
    }
    return box;
}
// только уникальные навыки
["JS", "Node", "SQL", "Python", "Docker", "React"]
const getUniqueSkils = (users) => {
    const box = new Set();
    for (const u of users) {
        for (s of u.skills) {
            box.add(s);
        }
    }
    return [...box.values()];
}
// найти всех пользователей со skill "Node"
const findUserBySkill = (users, skill) =>  users.filter((u) => u.skills.includes(skill));
// сколько всего навыков

// сгруппировать пользователей по навыкам



console.log('// получить все навыки');
console.log(getAllSkils(users));
console.log('// только уникальные навыки');
console.log(getUniqueSkils(users));

console.log('// найти всех пользователей со skill "Node"');
console.log(findUserBySkill(users, 'Node'));
console.log('// сколько всего навыков');
console.log(getAllSkils(users).length);
console.log('// сгруппировать пользователей по навыкам');
