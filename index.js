import express from "express";
import axios from "axios";

const app = express();
const port = 3000;
app.use(express.static("public"))
app.use(express.urlencoded({ extended: true }));
app.set("view engine","ejs");
let coins = ["BTC", "ETH", "SOL", "SHIB", "DOGE"];
app.use(express.static("public"))

app.get("/", async (req, res) => {
  try {
    let prices = [];

    const binancePrices = await getPrices("binance","Binance");
    prices.push(binancePrices);
    const bybitPrices = await getPrices("bybit_spot","Bybit");
    prices.push(bybitPrices);
    const kucoinPrices = await getPrices("kucoin","KuCoin");
    prices.push(kucoinPrices);
    const coinbasePrices = await getPrices("gdax","Coinbase");
    prices.push(coinbasePrices);

    const response = await axios.get("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_last_updated_at=true");
    let time = new Date(response.data.bitcoin.last_updated_at * 1000).toString().slice(0,25);

    res.render("index.ejs",{priceList:prices,lastUpdatedTime:time});

  } catch (error) {
    console.error("Error fetching prices:", error.status);
    res.status(500).send("Error fetching prices");
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

async function getPrices(exchange,name) {
  let url = `https://api.coingecko.com/api/v3/exchanges/${exchange}/tickers?coin_ids=bitcoin,ethereum,solana,shiba-inu,dogecoin`;
  try {
    const response = await axios.get(url);
    const filteredTickers = response.data.tickers.filter(
      (ticker) => coins.includes(ticker.base) && ticker.target === "USDT"
    );
    let result = {name:name}
    filteredTickers.forEach(ticker => {
      result[ticker.base] = ticker.converted_last.usd;
    });
    return result
  } catch (error) {
    console.error(`Error fetching data from ${url}:`, error.status);
    return [];
  }
}
