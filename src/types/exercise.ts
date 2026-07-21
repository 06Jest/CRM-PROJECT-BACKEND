// const leads = [
//   {
//     id: 1,
//     firstName: "John",
//     lastName: "Doe",
//     email: "john@gmail.com",
//     phone: "09171234567",
//   },
//   {
//     id: 2,
//     firstName: "John",
//     lastName: "Doe",
//     email: "JOHN@gmail.com",
//     phone: "09171234567",
//   },
//   {
//     id: 3,
//     firstName: "Jane",
//     lastName: "Smith",
//     email: "jane@gmail.com",
//     phone: "09170001111",
//   },
//   {
//     id: 4,
//     firstName: "Johnny",
//     lastName: "Doe",
//     email: "john@gmail.com",
//     phone: "09998887777",
//   },
// ];

//  interface Lead  {
//   id: number;
//   firstName: string;
//   lastName: string;
//   email: string;
//   phone: string;
// }

// interface Return  {
//   original: Lead;
//   duplicated: Lead[];
// }

// let original: Lead;
// let duplicated: Lead[];

// const checkLead = leads.map((lead: Lead) => {

//   if (lead.id === original.id) return;

//   if (lead.email === original.email || lead.phone === original.phone) {
//     original = lead;
//     duplicated.push(lead);
//   }
// })
