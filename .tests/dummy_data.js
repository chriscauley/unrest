var SCHEMA = [
  {name: "first_name", type: "text"},
  {name: "email", type: "email"},
  {name: 'select_color', type: 'select', choices: ['red','green','blue','pink']},
  {name: "textarea", type: "textarea"},
  {name: "checkboxes", type: "checkbox",choices: ['red','green','blue']},
  {name: "radios", type: "radio",choices: ['red','green','blue']},
];
var INITIAL = {
  first_name: "bob",
  email: "arst@arst.com",
  select_color: 'pink',
  textarea: "this is a story all about how my life got flipped, turned up side down.",
  radios: "blue",
  checkboxes: "green",
};
