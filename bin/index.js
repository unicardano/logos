const { Command } = require("commander");
const { exec } = require("child_process");
const { ChainId } = require("@sushiswap/core-sdk");
const fs = require("fs");
const { resolve } = require("path");
const { getAddress } = require("@ethersproject/address");

const program = new Command();

const NAME_TO_CHAIN_ID = {
  arbitrum: ChainId.ARBITRUM,
  avalanche: ChainId.AVALANCHE,
  fuji: ChainId.AVALANCHE_TESTNET,
  binance: ChainId.BSC,
  celo: ChainId.CELO,
  ethereum: ChainId.ETHEREUM,
  ropsten: [ChainId.ROPSTEN],
  rinkeby: [ChainId.RINKEBY],
  kovan: [ChainId.KOVAN],
  gorli: [ChainId.GÖRLI],
  fantom: ChainId.FANTOM,
  fuse: ChainId.FUSE,
  harmony: ChainId.HARMONY,
  heco: ChainId.HECO,
  matic: ChainId.MATIC,
  moonriver: ChainId.MOONRIVER,
  okex: ChainId.OKEX,
  palm: ChainId.PALM,
  telos: ChainId.TELOS,
  xdai: ChainId.XDAI,
};

const CHAIN_ID_TO_NAME = {
  [ChainId.ARBITRUM]: "arbitrum",
  [ChainId.AVALANCHE]: "avalanche",
  [ChainId.AVALANCHE_TESTNET]: "fuji",
  [ChainId.BSC]: "binance",
  [ChainId.CELO]: "celo",
  [ChainId.ETHEREUM]: "ethereum",
  [ChainId.ROPSTEN]: "ropsten",
  [ChainId.RINKEBY]: "rinkeby",
  [ChainId.KOVAN]: "kovan",
  [ChainId.GÖRLI]: "gorli",
  [ChainId.FANTOM]: "fantom",
  [ChainId.FUSE]: "fuse",
  [ChainId.HARMONY]: "harmony",
  [ChainId.HECO]: "heco",
  [ChainId.MATIC]: "matic",
  [ChainId.MOONRIVER]: "moonriver",
  [ChainId.OKEX]: "okex",
  [ChainId.PALM]: "palm",
  [ChainId.TELOS]: "telos",
  [ChainId.XDAI]: "xdai",
};

// TODO: #8 Add network and agnostic clone command to bin/index.js which
// will for example clone
// from token/eth.jpg
// to network/arbitrum/0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f.jpg

program
  .command("clone")
  .arguments("<name> <network> <address>")
  .action((name, network, address) => {
    console.log(
      `Performing clone of ${name}.jpg from the tokens directory to network/${network}/${address}.jpg`
    );

    if (!(network in NAME_TO_CHAIN_ID)) {
      throw Error(`No network for ${network}`);
    }

    const from = resolve(__dirname, `../token/${name}.jpg`);

    if (!fs.existsSync(from)) {
      throw Error(`No token found with name ${name} at path ${path}`);
    }

    const to = resolve(
      __dirname,
      `../network/${network}/${getAddress(address)}.jpg`
    );

    exec(`cp ${from} ${to}`, () => console.log(`Copied ${from} -> ${to}`));
  });

program.command("invalidate:all").action(() => {
  console.log("invalidate:all command called");
  for (const chainId of Object.keys(ChainId)) {
    if (!(chainId in CHAIN_ID_TO_NAME)) {
      console.error(
        `No name to map from chainId: ${chainId} -> name: ${CHAIN_ID_TO_NAME[chainId]}`
      );
      continue;
    }

    console.log(`Invalidate cache for network ${CHAIN_ID_TO_NAME[chainId]}`);

    const path = resolve(__dirname, `../network/${CHAIN_ID_TO_NAME[chainId]}`);

    console.log({ path });

    if (!fs.existsSync(path)) {
      console.error(`No network found for path ${path}`);
      continue;
    }

    fs.readdir(path, (error, files) => {
      if (error) console.error(error);
      for (const token of files) {
        console.log(
          `Invalidating https://raw.githubusercontent.com/sushiswap/logos/main/${CHAIN_ID_TO_NAME[chainId]}/${token}`
        );
        exec(
          `/usr/local/bin/cld uploader explicit "https://raw.githubusercontent.com/sushiswap/logos/main/${CHAIN_ID_TO_NAME[chainId]}/${token}" type="fetch" invalidate="true" eager='[{ "width": 24 }, { "width": 32 }, { "width": 48 }, { "width": 64 }, { "width": 96 }, { "width": 128 }]'`,
          () =>
            console.log(
              `Invalidated https://raw.githubusercontent.com/sushiswap/logos/main/${CHAIN_ID_TO_NAME[chainId]}/${token}`
            )
        );
      }
    });
  }
});

program
  .command("invalidate:network")
  .arguments("<network>")
  .action((network) => {
    console.log("invalidate:network command called", { network });

    if (!network) {
      throw Error(`No network configured for ${network}`);
    }

    const NETWORK =
      Number(network) in CHAIN_ID_TO_NAME ? CHAIN_ID_TO_NAME[network] : network;

    console.log(`Invalidating cache for network ${NETWORK}`);

    const path = resolve(__dirname, `../network/${NETWORK}`);

    if (!fs.existsSync(path)) {
      throw Error(`Path does not exist for ${path}`);
    }

    fs.readdir(path, (error, files) => {
      if (error) console.error(error);
      for (const token of files) {
        console.log(
          `Invalidating https://raw.githubusercontent.com/sushiswap/logos/main/network/${NETWORK}/${token}`
        );
        exec(
          `/usr/local/bin/cld uploader explicit "https://raw.githubusercontent.com/sushiswap/logos/main/network/${NETWORK}/${token}" type="fetch" invalidate="true" eager='[{ "width": 24 }, { "width": 32 }, { "width": 48 }, { "width": 54 }, { "width": 64 }, { "width": 96 }, { "width": 128 }]'`,
          () =>
            console.log(
              `Invalidated https://raw.githubusercontent.com/sushiswap/logos/main/network/${NETWORK}/${token}`
            )
        );
      }
    });
  });

program
  .command("invalidate:token")
  .arguments("<network> <token>")
  .action((network, token) => {
    console.log("invalidate:token command called", { network, token });

    if (!network) {
      throw Error("No network was passed");
    }

    if (!token) {
      throw Error("No token was passed");
    }

    const NETWORK =
      Number(network) in CHAIN_ID_TO_NAME ? CHAIN_ID_TO_NAME[network] : network;

    console.log(`Invalidate cache for network ${NETWORK} and token ${token}`);

    const path = resolve(__dirname, `../network/${NETWORK}/${token}.jpg`);

    if (!fs.existsSync(path)) {
      throw Error(`Path does not exist for ${path}`);
    }

    console.log(
      `Invalidating https://raw.githubusercontent.com/sushiswap/logos/main/network/${NETWORK}/${token}.jpg`
    );

    exec(
      `/usr/local/bin/cld uploader explicit "https://raw.githubusercontent.com/sushiswap/logos/main/network/${NETWORK}/${token}.jpg" type="fetch" invalidate="true" eager='[{ "width": 24 }, { "width": 32 }, { "width": 48 }, { "width": 54 }, { "width": 64 }, { "width": 96 }, { "width": 128 }]'`,
      (error, stdout) => {
        if (error) {
          console.error(error);
        } else {
          console.log(stdout);
          console.log(
            `Invalidated https://raw.githubusercontent.com/sushiswap/logos/main/network/${NETWORK}/${token}.jpg`
          );
        }
      }
    );
  });

program.parse(process.argv);
