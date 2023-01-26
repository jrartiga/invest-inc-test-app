import React, { useState } from 'react'
import type { NextPage, NextPageContext } from 'next'
import getConfig from "next/config"
import axios from 'axios'
import { Symbols } from './api/Symbols'
import { OrderBook } from './OrderBook'
const { publicRuntimeConfig } = getConfig()

type Symbol = {
    key: string
    fromKey: string
    toKey: string
  }

  type Props = {
    symbolsArray: Array<Symbol>
  }

const Home: NextPage<Props> = (props) =>{
    const [fromKey, setFromKey] = useState<string>('BTC')
    const [toKey, setToKey] = useState<string>('USDT')
    return (
        <div className='bg-[#161A1E] h-screen'>
            <Symbols 
                symbolsArray={props.symbolsArray}
                onChangeFromKey={(key: string)=> setFromKey(key)}
                onChangeToKey={(key: string)=> setToKey(key)}
                />
            <OrderBook symbol={`${fromKey}${toKey}`} from={fromKey} to={toKey} />
        </div>
    )
}

export default Home

// Server Side Rendering (SSR) --> Loading the Symbols pais before first loading
// --> https://binance-docs.github.io/apidocs/spot/en/#diff-depth-stream
Home.getInitialProps = async (ctx: NextPageContext): Promise<Props> => {

    const headers = {
      'Content-Type' : 'application/json'
    }
  
    try{
      const binanceAPI = publicRuntimeConfig.BINANCE_API
      const symbolsEndpoint = 'api/v3/exchangeInfo'
      
      const resultArray: Array<Symbol> = []
      const { data } = await axios.get(`${binanceAPI}/${symbolsEndpoint}`, { headers })
      data.symbols.filter((item: any) => item.quoteAsset && item.baseAsset).forEach((item: any) => {
        if(!resultArray.find((val: Symbol) => val.key ===  item.symbol)){
          resultArray.push({
            key: item.symbol,
            fromKey: item.baseAsset,
            toKey: item.quoteAsset,
          })
        }
      })
  
      return {
        symbolsArray: resultArray
      }
    }catch(e){
      console.log("error -> getSymbols :::::: ", e)
      return {
        symbolsArray: []
      }
    }
  
  }