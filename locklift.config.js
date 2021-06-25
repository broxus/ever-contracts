module.exports = {
  compiler: {
    path: '/usr/bin/solc-ton-broxus',
  },
  linker: {
    path: '/usr/bin/tvm_linker',
  },
  networks: {
    dev: {
      ton_client: {
        network: {
          server_address: 'https://net.ton.dev'
        }
      },
      giver: {
        address: '0:6c2f2e13d566aee4cbec3ea9960184177313a9618df6237525ef5751df7ee856',
        abi: { "ABI version": 2, "header": ["pubkey", "time", "expire"], "functions": [ { "name": "constructor", "inputs": [ ], "outputs": [ ] }, { "name": "sendGrams", "inputs": [ {"name":"dest","type":"address"}, {"name":"amount","type":"uint64"} ], "outputs": [ ] }, { "name": "owner", "inputs": [ ], "outputs": [ {"name":"owner","type":"uint256"} ] } ], "data": [ {"key":1,"name":"owner","type":"uint256"} ], "events": [ ] },
        key: process.env.DEV_GIVER_KEY,
      },
      keys: {
        phrase: '',
        amount: 20,
      }
    },
    main: {
      ton_client: {
        network: {
          server_address: 'https://main.ton.dev'
        }
      },
      giver: {
        address: '0:3bcef54ea5fe3e68ac31b17799cdea8b7cffd4da75b0b1a70b93a18b5c87f723',
        abi: { "ABI version": 2, "header": ["pubkey", "time", "expire"], "functions": [ { "name": "constructor", "inputs": [ ], "outputs": [ ] }, { "name": "sendGrams", "inputs": [ {"name":"dest","type":"address"}, {"name":"amount","type":"uint64"} ], "outputs": [ ] }, { "name": "owner", "inputs": [ ], "outputs": [ {"name":"owner","type":"uint256"} ] } ], "data": [ {"key":1,"name":"owner","type":"uint256"} ], "events": [ ] },
        key: process.env.MAIN_GIVER_KEY,
      },
      keys: {
        phrase: '',
        amount: 20,
      }
    },
    local: {
      ton_client: {
        network: {
          server_address: 'http://localhost/',
        },
      },
      giver: {
        address: '0:841288ed3b55d9cdafa806807f02a0ae0c169aa5edfe88a789a6482429756a94',
        abi: { "ABI version": 1, "functions": [ { "name": "constructor", "inputs": [], "outputs": [] }, { "name": "sendGrams", "inputs": [ {"name":"dest","type":"address"}, {"name":"amount","type":"uint64"} ], "outputs": [] } ], "events": [], "data": [] },
        key: '',
      },
      keys: {
        phrase: '',
        amount: 20,
      }
    },
  },
};
