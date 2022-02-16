const mysql = require('mysql2/promise');
connectInnoDB();

// Desde esta function se puede ver cómo InnoDB soporta transactions (ACID).
async function connectInnoDB() {
  try {
    const con = await mysql.createConnection({
      'host': 'docker.for.lin.localhost',
      'port': 3306,
      'user': 'root',
      'password': 'password',
      'database': 'test'
    });

    await con.beginTransaction();
    await con.query(
      'INSERT INTO employees_innodb (name) values (?)',
      ['Esteban Dido']
    );

    const [rows, _] = await con.query(
      'select * from employees_innodb'
    );
    console.table(rows);

    await con.commit();
    await con.close();
  } catch(ex){
    console.error(ex)
  }
}

// Desde esta function se puede ver cómo MyISAM no soporta transactions (ACID) y sin hacer commit
// de la transaction ya realizó el insert.
async function connectMyISAM(){
  try {
    const con = await mysql.createConnection({
      'host': 'docker.for.lin.localhost',
      'port': 3306,
      'user': 'root',
      'password': 'password',
      'database': 'test'
    });

    await con.beginTransaction();
    await con.query(
      'INSERT INTO employees_myisam (name) values (?)',
      ['Esteban Dido']
    );

    await con.commit();
    await con.close();
  } catch(ex){
    console.error(ex)
  }
}
