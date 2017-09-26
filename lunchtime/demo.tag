<lunch-table>
  <input name="input" value={ value } onchange={ sync } onkeyup={ sync }/>
  <table>
    <tr each={ rows }>
      <th><span class="g">"{ value }"</span>.{ name }()</th>
      <td>{ output && output() || parent.value[name]() }</td>
    </tr>
  </table>

  <style>
    .g { color: green; }
  </style>

  this.rows = [
    { name: 'date' },
    { name: 'time' },
    { name: 'datetime' },
    { name: 'hdate' },
    { name: 'htime' },
    { name: 'hdatetime' },
  ];
  this.value = moment().format();
  sync(e) {
    this.value = this.input.value;
  }

</lunch-table>
