export type Skill="continuity"|"organization"|"naturalness"|"vocabulary"|"selfRepair"|"conversation"|"pronunciation";
export type VocabularyItem={phrase:string;meaning:string;example:string;status:"new"|"exposed"|"used"|"mastered";uses:number};
export type SessionState={level:number;xp:number;streak:number;completed:number;skills:Record<Skill,number>;vocabulary:VocabularyItem[];weakPatterns:string[]};
export const initialState:SessionState={level:1,xp:0,streak:0,completed:0,skills:{continuity:62,organization:54,naturalness:50,vocabulary:48,selfRepair:66,conversation:58,pronunciation:50},vocabulary:[
{phrase:"I'd rather...",meaning:"I prefer one option.",example:"I'd rather work from home.",status:"new",uses:0},
{phrase:"That's why...",meaning:"Connect a reason to a result.",example:"The commute is exhausting. That's why I prefer remote work.",status:"new",uses:0},
{phrase:"On the other hand...",meaning:"Introduce a contrasting point.",example:"The job pays well. On the other hand, it requires travel.",status:"new",uses:0},
{phrase:"I'm looking forward to...",meaning:"Show excitement about a future event.",example:"I'm looking forward to improving my English.",status:"new",uses:0},
{phrase:"It was worth it.",meaning:"The result justified the cost or effort.",example:"The trip was expensive, but it was worth it.",status:"new",uses:0},
{phrase:"What I mean is...",meaning:"Repair or clarify what you just said.",example:"What I mean is, I want more flexibility.",status:"new",uses:0}],weakPatterns:["sentence restarting","repeated fillers","word-choice precision"]};
const tasks=[
["Everyday conversation","Tell me about something you did today and one thing you are planning to do tomorrow.","conversation"],
["Personal story","Tell me about a recent experience that taught you something.","story"],
["Explain clearly","Explain something you know well as if you were explaining it to a new friend.","explain"],
["Opinion","Do you think working from home is better than working in an office? Explain your view.","opinion"],
["Unexpected topic","Do you think people learn more from failure or success? Give examples.","opinion"],
["Role-play","You booked a hotel room, but the room is not what you were promised. Speak to reception and solve the problem.","roleplay"],
["Problem solving","Your important appointment is tomorrow, but your transport is cancelled. Explain what you would do.","roleplay"],
["Mini debate","A friend says: Technology makes people less social. Respond and defend your position.","debate"],
["Abstract discussion","Can a person be successful without being happy? Explain both sides before giving your view.","debate"],
["Real-world conversation","Imagine we have just met. Tell me about your life, what you want next, and one thing you are working to improve.","conversation"]];
export function nextTask(level:number){const t=tasks[Math.min(level-1,tasks.length-1)];return {title:t[0],prompt:t[1],mode:t[2]}}
