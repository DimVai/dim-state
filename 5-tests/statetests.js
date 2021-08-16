
//State.setStateVariablesPublic();

let varray = "varray";
State.create(varray, [13,42]);

State.synchronize(enemies,"localStorage")
State.synchronize(petaloudes,"sessionStorage");