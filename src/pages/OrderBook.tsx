import React, { useState, useEffect, FC } from 'react'
import axios from 'axios'
import useWebSocket from 'react-use-websocket'
import type { NextPage } from 'next'
import getConfig from "next/config"
const { publicRuntimeConfig } = getConfig()

// tailwindcss classes
const styles = {
  mainContainer: 'bg-[#161A1E] h-screen',
  bookContainer: 'w-full mx-auto pt-10 sm:pt-24 px-4 sm:px-0',
  table: 'min-w-[348px] w-full max-w-sm mx-auto',
  row: '',
  col: {
    title: 'text-[#848E9C] !font-light',
    base: 'text-xs font-normal',
    price: 'text-left',
    amount: 'ml-6 text-right text-[#B7BDC6]',
    total: 'ml-6 text-right text-[#B7BDC6]',
    positive: 'text-[#0ECB81]',
    negative: 'text-[#F6465D]'
  }
}

type DepthSnapshotType = {
  lastUpdateId: number
  bids: Array<Array<string>>
}

type MessageType = {
  e: string
  E: number
  s: string
  U: number
  u: number
  b: Array<Array<string>>
  a: Array<Array<string>>
  error?: any
}

type OrderBookRow = {
  price: number
  amount: number
  total: number
}

type Props = {
  symbol: string
  from: string
  to: string
}

export const OrderBook: NextPage<Props> = (props) =>{
  const wsUrl = publicRuntimeConfig.WEBSOCKET_BINANCE
  const [depthSnapshot, setDepthSnapshot] = useState<DepthSnapshotType>()
  const [orderBookData, setOrderBookData] = useState<Array<OrderBookRow>>([])
  const [orderBookEndPoint, setOrderBookEndPoint] = useState<string>(`api/v3/depth?symbol=${props.symbol}&limit=1000`)
  const [socketUrl, setSocketUrl] = useState<string>(`${wsUrl}/${props.symbol.toLowerCase()}@depth`)
  const [idSubscription, setIdSubscription] = useState<number>(1011) //--> any number

  const { sendJsonMessage } = useWebSocket(socketUrl, {
    onOpen: () => console.log('WebSocket connection opened.'),
    onClose: () => console.log('WebSocket connection closed.'),
    shouldReconnect: (closeEvent) => true,
    onMessage: (event: WebSocketEventMap['message']) =>  processMessages(event)
  });

  useEffect(()=>{
    getOrderBook()
    const subscribe = {
      'method': "SUBSCRIBE",
      'params': `["${props.symbol.toLowerCase()}@depth"]`,
        "id": idSubscription
    }

    sendJsonMessage(subscribe)

    return ()=>{
      const unSubscribe = {
        'method': "UNSUBSCRIBE",
        'params': `["${props.symbol.toLowerCase()}@depth"]`,
        "id": idSubscription
      }
      
      return sendJsonMessage(unSubscribe)
    }
  },[])
  
  const skipDepthValue = (currentDepth: any) =>{// https://binance-docs.github.io/apidocs/spot/en/#how-to-manage-a-local-order-book-correctly
    if(depthSnapshot 
        && currentDepth.u <= depthSnapshot.lastUpdateId 
        && currentDepth.u >= (depthSnapshot.lastUpdateId + 1)) return true
    return false
  }

  const processMessages = async(event: any) =>{
    if(!event || !event.data) return 
    try{
      const message: MessageType = JSON.parse(event.data)
      if(!message.error){
        if(skipDepthValue(message)) return
        makeMessageReadable(message)
      }
    }catch(e){
      console.log("Fail : ", { error: e, message: event.data })
    }
  }

  const makeMessageReadable = (message: MessageType) =>{
    const bids = message.b
      .filter((item: Array<string>) =>( Math.abs(parseFloat(item[0])) * Math.abs(parseFloat(item[1])) > 0))
      .map((item: Array<string>) => {
        return {
          price: Math.abs(parseFloat(item[0])),
          amount: Math.abs(parseFloat(item[1])),
          total: Math.abs(parseFloat(item[0])) * Math.abs(parseFloat(item[1]))
        }
      })
      .slice(0,40)

    setOrderBookData(bids)
  }

  const getOrderBook = async() =>{// --> https://binance-docs.github.io/apidocs/spot/en/#diff-depth-stream
    const headers = {
      'Content-Type' : 'application/json'
    }

    try{
      const binanceAPI = publicRuntimeConfig.BINANCE_API
      const { data } = await axios.get(`${binanceAPI}/${orderBookEndPoint}`, { headers })
      setDepthSnapshot(data)
    }catch(e){
      console.log("error :::::: ", e)
      return {}
    } 
  }

  const DataRow: FC<OrderBookRow & {isPositive?: boolean}> = (props) =>(
    <tr>
      <td className={`${styles.col.base} ${styles.col.price} ${props.isPositive? styles.col.positive : styles.col.negative}`}>{props.price}</td>
      <td className={`${styles.col.base} ${styles.col.amount}`}>{props.amount.toFixed(5)}</td>
      <td className={`${styles.col.base} ${styles.col.total}`}>{props.total.toFixed(5)}</td>
    </tr>
  )

  return (
    <div className={styles.mainContainer}>
      <div className={styles.bookContainer}>
        {orderBookData.length > 0?
          <table className={styles.table}>
            <tr>
              <th className={`${styles.col.base} ${styles.col.title} text-left`}>Price({props.to})</th>
              <th className={`${styles.col.base} ${styles.col.title} text-right`}>Amount({props.from})</th>
              <th className={`${styles.col.base} ${styles.col.title} text-right`}>Total</th>
            </tr>
            <tr><div className='mb-3'></div></tr>
            {
              orderBookData.slice(0,20).map((item: OrderBookRow, idx: number)=><DataRow key={idx} {...item} />)
            }
            {
              orderBookData.slice(20,40).map((item: OrderBookRow, idx: number)=><DataRow key={idx} {...item} isPositive />)
            }
        </table>
        :
        <></>  
      }
      </div>
    </div>
  )
}