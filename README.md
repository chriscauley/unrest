Unrest.js
========

This is a collection of riot.js tags and utilities which I am collecting into a framework. If you are interested please reach out to me at chris@unrest.io.

form.tag
========

The core of this library is the `ur-form` tag. This generates a dynamic form from a json schema object.

``` html
<ur-form method="POST" action="/some_url/" schema="{ window.MY_SCHEMA }" ajax_success="{ window.ajaxSuccess }"></ur-form>
```

```js
function validatePhone(value,riot_tag) {
  if (value.replace(/\D/g,'').length <10) {
    riot_tag.data_error = "Phone number must have at least 10 digits";
    return false;
  }
  return true
}
window.MY_SCHEMA = [
  "first_name",
  "last_name",
  { name: "phone_number", validate: validatePhone, required: false },
  { name: "email", type: "email" },
];
riot.mount("ur-form");
```
