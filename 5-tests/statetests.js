
// jshint ignore: start

//State.setStateVariablesPublic();

//let varray = "varray";
State.create("varray", [13,42]);


//State.createDependency(varray,[enemies],'State[varray]=State[enemies]*2');

State.synchronize("enemies","localStorage");
State.synchronize("petaloudes","sessionStorage");


//State.create("synchronize", [13,42]);
