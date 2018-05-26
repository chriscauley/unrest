<lunch-table>
  <input ref="input" value={ current_value } onchange={ sync } onkeyup={ sync }/>
  <table>
    <tr each={ row,i in rows }>
      <th><span class="g">"{ current_value }"</span>.{ row.name }()</th>
      <td>{ output || current_value[row.name]() }</td>
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
    { name: 'htimedelta' },
  ];
  this.current_value = moment().format("YYYY-MM-DD HH:mm")
  sync(e) {
    this.current_value = this.refs.input.value;
  }
setInterval(() => this.update(),1000);
</lunch-table>
