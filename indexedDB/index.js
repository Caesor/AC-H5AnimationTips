import monitor from 'js/report/monitor.js';

const DB_NAME = 'buluo-gift-zip-resource';
const DB_VERSION = 1.0;
const DB_STORE_NAME = 'gifts';

class DB {
    constructor(options) {
        this.defaultConfig = {
            name: DB_NAME,
            storeName: DB_STORE_NAME,
            version: DB_VERSION
        };
        this.config = Object.assign({}, this.defaultConfig, options);
        this.ready = false;
        // this.db = null;
    }

    connect(options) {
        if (typeof (options) === 'object') {
            if (this.ready) {
                return new Error('indexedDB has been used');
            }

            for (let i in options) {
                if (i === 'storeName') {
                    options[i] = options[i].replace(/\W/g, '_');
                }
            }
        }
        const self = this;
        return new Promise(function(resolve, reject) {
            console.log('indexDB connecting....');

            let req = indexedDB.open(DB_NAME, DB_VERSION);

            req.onsuccess = function(e) {
                self.db = this.result;
                console.log('indexDB connected');
                resolve(1);
            };

            req.onerror = function(e) {
                console.log('indexDB connected error, ', e.target.errorCode);
                reject(e);
            };

            req.onupgradeneeded = function(e) {
                console.log('indexDB onupgradeneeded');

                let store = e.currentTarget.result.createObjectStore(
                    DB_STORE_NAME, { keyPath: 'fileName' }
                );

                store.createIndex('packageID', 'packageID', { unique: false });

                resolve(1);
            };
        });
    }

    async setAllData(packageID, dataGroup, callback) {

        await this.connect();

        let store = this.db
            .transaction(DB_STORE_NAME, 'readwrite')
            .objectStore(DB_STORE_NAME);

        for (let i = 0; i < dataGroup.length; i++) {
            let req = store.add(Object.assign({}, dataGroup[i], { packageID }));

            req.onsuccess = function(e) {
                callback && callback();
                console.log(e.target.result, ' has been write in indexedDB');
                monitor(2925599);
            };

            req.onerror = function(e) {
                console.log('data wrote failed', e.currentTarget.error.message);
                monitor(2925600);
            };
        }
    }

    async getAllData(packageID) {

        await this.connect();

        const self = this;

        return new Promise(function(resolve, reject) {

            let singleKeyRange = IDBKeyRange.only(packageID + '');
            let req = self.db
                .transaction(DB_STORE_NAME, 'readonly')
                .objectStore(DB_STORE_NAME)
                .index('packageID')
                .openCursor(singleKeyRange);

            let result = [];

            req.onsuccess = function(e) {
                let cursor = e.target.result;

                if (cursor) {
                    result.push(cursor.value);
                    cursor.continue();
                } else {
                    resolve(result);
                }
            };

            req.onerror = function(e) {
                console.log('get Data from indexDB error');
                reject(e);
            };
        });
    }

    async delAllData(packageID) {

        await this.connect();

        let transaction = this.db.transaction(DB_STORE_NAME, 'readwrite');
        let store = transaction.objectStore(DB_STORE_NAME);
        let index = store.index('packageID');

        let singleKeyRange = IDBKeyRange.only(packageID.toString());
        let req = index.openCursor(singleKeyRange);

        req.onsuccess = function(e) {
            let cursor = e.target.result;

            if (cursor) {
                store.delete(cursor.value.fileName);
                cursor.continue();
            } else {
                console.log('all Data deleted from indexedDB');
            }
        };

        req.onerror = function(e) {
            console.log('Data deleted failed from indexedDB');
        };
    }

    async delDB() {
        await this.connect();
        indexedDB.deleteDatabase(DB_NAME);
        console.log(`indexedDB ${DB_NAME} deleted.`);
    }
}

export default new DB();