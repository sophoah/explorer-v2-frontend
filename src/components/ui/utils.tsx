import Big from "big.js";
import React from "react";
import { useONEExchangeRate } from "src/hooks/useONEExchangeRate";
import { calculateFee } from "../../utils/fee";
import {RPCStakingTransactionHarmony, RPCTransactionHarmony} from "../../types";

export function formatNumber(
  num: number,
  options?: Intl.NumberFormatOptions
): string {
  if (num === undefined) return "";

  return num.toLocaleString("en-US", options);
}

export function reintervate(
  func: () => any,
  interval: number
): number | Promise<number> {
  const res = func();
  if (res instanceof Promise) {
    return res.then(() =>
      window.setTimeout(() => reintervate(func, interval), interval)
    );
  } else {
    return window.setTimeout(() => reintervate(func, interval), interval);
  }
}

Big.DP = 21;
Big.NE = -20;
Big.PE = 15;

export function CalculateFee(transaction: any) {
  const { lastPrice } = useONEExchangeRate();

  if(!(transaction && transaction.gasPrice)) {
    return ''
  }

  const fee = isNaN(transaction.gasPrice)
    ? 0
    : Number(transaction.gasPrice) / 10 ** 14 / 10000;

  const normalizedFee = Intl.NumberFormat("en-US", {
    maximumFractionDigits: 18,
  }).format(fee);

  const price = lastPrice;

  const bi =
    (Big(normalizedFee) as unknown as number) /
    (Big(10 ** 14) as unknown as any);
  const v = parseInt(bi.toString()) / 10000;
  let USDValue = "";

  if (price && v > 0) {
    USDValue = (v * +price).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      currency: "USD",
    });
  }

  return (
    <>
      {normalizedFee} ONE
      {!USDValue || USDValue === "0.00" || USDValue == "0" ? null : (
        <>($ {USDValue})</>
      )}
    </>
  );
}

export function CalculateTransactionFee(transaction: RPCTransactionHarmony | RPCStakingTransactionHarmony) {
  const { lastPrice: price } = useONEExchangeRate();

  if(!(transaction && transaction.gas)) {
    return ''
  }

  const fee = calculateFee(transaction.gas, transaction.gasPrice)

  const bi =
    (Big(fee) as unknown as number) /
    (Big(10 ** 14) as unknown as any);
  const v = parseInt(bi.toString()) / 10000;
  let USDValue = "";

  if (price && v > 0) {
    USDValue = (v * +price).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      currency: "USD",
    });
  }

  return (
    <>
      {fee} ONE
      {!USDValue || USDValue === "0.00" || USDValue == "0" ? null : (
        <>($ {USDValue})</>
      )}
    </>
  );
}
