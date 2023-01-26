import React, { useEffect, useState } from 'react'
import type { NextPage } from 'next'
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

type Symbol = {
  key: string
  fromKey: string
  toKey: string
}

type Props = {
  symbolsArray: Array<Symbol>
  onChangeFromKey: (key: string) => void
  onChangeToKey: (key: string) => void
}

export const Symbols: NextPage<Props> = (props) =>{
    const [fromKey, setFromKey] = useState<string>('BTC')
    const [toKey, setToKey] = useState<string>('USDT')
    const [fromDropdown, setFromDropdown] = useState<Array<string>>([])
    const [toDropdown, setToDropdown] = useState<Array<string>>([])

    useEffect(()=>{
        const fromArray: Array<string> = []
        const toArray: Array<string> = []

        props.symbolsArray.forEach((item: Symbol) => {

            if(!fromArray.find(key => key === item.fromKey)){
                fromArray.push(item.fromKey)
            }


            if(!toArray.find(key => key === item.toKey)){
                toArray.push(item.fromKey)
            }

        })

        setFromDropdown(fromArray)
        setToDropdown(toArray)

    },[])

    const handleChangeFromKey = (key: string) =>{
        setFromKey(key)
        props.onChangeFromKey(key)
    }

    const handleChangeToKey = (key: string) =>{
        setToKey(key)
        props.onChangeToKey(key)
    }

    return (
        <>
        {
            fromDropdown.length > 0 && toDropdown.length > 0?
            <div className='flex justify-center w-full pt-10 sm:pt-24'>
                <FormControl>
                    <Select 
                    className='bg-[#848E9C] mx-8'
                    labelId='from-key'
                    id='from-key'
                    value={fromKey}
                    label={fromKey}
                    onChange={(event: SelectChangeEvent) => handleChangeFromKey(event.target.value as string)}
                    >
                    {
                        fromDropdown.map((key: string, idx: number) =><MenuItem key={idx} value={key}>{key}</MenuItem>)
                    }
                    </Select>
                </FormControl>
                <FormControl>
                    <Select 
                    className='bg-[#848E9C] mx-8'
                    labelId='to-key'
                    id='to-key'
                    value={toKey}
                    label={toKey}
                    onChange={(event: SelectChangeEvent) => handleChangeToKey(event.target.value as string)}
                    >
                    {
                        toDropdown.map((key: string, idx: number) =><MenuItem key={idx} value={key}>{key}</MenuItem>)
                    }
                    </Select>
                </FormControl>
            </div>
                
            :
            <></>
        }
        </>
    )
}