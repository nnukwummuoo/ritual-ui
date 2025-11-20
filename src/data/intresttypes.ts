import { Tag } from "lucide-react";
import { ta } from "zod/v4/locales";

export const interst = [
  "Family",
  "Human sexuality",
  "Acquaintances",
  "Friendships",
  "Long distance",
  "Open relationships",
  "Friends with benefits",
  "Casual",
  "Companionate love",
  "Marriage",
  "Professional relationship",
];

interface golds {
  value: number;
  amount: number;  // Enforce number, not string
  bonus?: number | string;
  tag?: string;
}

// export const golds = [
//     {
//         amount: "1000 GOLD for $79.99",
//         bonus: "( 37% Bonus )",
//         value:"price_1QDljSBzYNWJ8mmsdYQ0TQcs",
//         price:`${1000 + 37}`

//     },
//     {
//         amount: "750 GOLD for $62.99",
//         bonus: "( 32% Bonus )",
//         value:"price_1QDlibBzYNWJ8mmseH5fmD4F",
//         price:`${750 + 32}`

//     },
//     {
//         amount: "550 GOLD for $49.99",
//         bonus: "( 21% Bonus )",
//         value:"price_1QDlhoBzYNWJ8mmsZZn2lBGb",
//         price:`${550 + 21}`

//     },
//     {
//         amount: "400 GOLD for $39.99",
//         bonus: "( 10% Bonus )",
//         value:"price_1QDlgmBzYNWJ8mmsQyub90xV",
//         price:`${400 + 10}`

//     },
//      {
//         amount: "200 GOLD for $20.99",
//         bonus: "( 5% Bonus )",
//         value:"price_1QDlfuBzYNWJ8mmsmff1NZRk",
//         price:`${200 + 5}`

//     },
//     {
//         amount: "100 GOLD for $10.99",
//         bonus: "",
//         value:"price_1QDlf9BzYNWJ8mmssEmyJQFC",
//         price:`${100}`

//     },
//     {
//         amount: "50 GOLD for $6.99",
//         bonus: "",
//         value:"price_1QDldVBzYNWJ8mmsvjEAxWGD",
//         price:`${50}`

//     }
// ]
export const golds = [
  {
    id: "pack_1000",
    amount: "$65.99",
    value: "1000",
    price: `${1000 + 37}`,
    tag: "Best Value",
  },
  {
    id: "pack_400",
    amount: "$35.99",
    value: "400",
    price: `${400 + 10}`,
    tag: "Most Popular",
  },
  {
    id: "pack_200",
    amount: "$19.99",
    value: "200",
    price: `${200 + 5}`,
    tag: "Hot Choice",
  },
  {
    id: "pack_100",
    amount: "$9.99",
    value: "100",
    price: `${100}`,
    tag: "Casual Fan",
  },
  {
    id: "pack_50",
    amount: "$5.99",
    value: "50",
    price: `${50}`,
  },
  {
    id: "pack_test_100",
    amount: "$1.00",
    value: "99",
    price: "99",
    tag: "Test Pack",
  },
];

export const PAY_API =
  "pk_test_51QDjyHBzYNWJ8mmsiihz7oyzaDi8ibP5xXBYdp3NBq0WStcIpEvqmN4oSJ2cKfQi6KTVZbpwdp9zxNp2X7wZfQNQ00fWzQqRAc";
