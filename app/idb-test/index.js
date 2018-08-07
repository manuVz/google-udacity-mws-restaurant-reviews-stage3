import idb from 'idb';

const idbPromise = idb.open('test-db', 1 , upgradeDb => {
    const KeyValStore = upgradeDb.createObjectStore('keyval');
    KeyValStore.put('world', 'hello');
});