/**
 * The customer and his family, in one place so every card, claim and
 * application names them the same way. Placeholder people for the
 * prototype: a Chennai family, named the Tamil way, where the surname is
 * the father's given name (Arjun's father is Raghavan, so Arjun Raghavan;
 * Raghavan's father was Srinivasan).
 *
 * Arjun's own family floater covers him, his wife and their two children;
 * his parents have their own policy.
 */
export type Person = { name: string; relation: string; dob: string };

export const self: Person = { name: "Arjun Raghavan", relation: "You", dob: "17 Nov 1990" };
export const wife: Person = { name: "Kavya Raghavan", relation: "Wife", dob: "2 Jan 1993" };
export const son: Person = { name: "Aditya Raghavan", relation: "Son", dob: "22 Feb 2017" };
export const daughter: Person = { name: "Meera Raghavan", relation: "Daughter", dob: "19 Oct 2020" };
export const father: Person = { name: "Raghavan Srinivasan", relation: "Father", dob: "5 Mar 1960" };
export const mother: Person = { name: "Lakshmi Raghavan", relation: "Mother", dob: "14 Aug 1964" };

/** On Arjun's family floater. */
export const ownFamily = [self, wife, son, daughter];
/** On the parents' policy. */
export const parents = [father, mother];
