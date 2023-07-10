import React, { useState } from "react";
import { Box, Text, TextArea } from "grommet";
import { AddressDetails, ShardID } from "src/types";
import { Item } from "../AddressDetails";
import { useHistory } from "react-router-dom";
import styled from "styled-components";
import { ISourceCode } from "src/api/explorerV1";
import { AbiMethodsView } from "./AbiMethodView";
import { AbiItem } from "web3-utils";
import { Wallet } from "./ConnectWallets";
import {Address} from "../../../components/ui";

const StyledTextArea = styled(TextArea)`
  padding: 0.75rem;
  border-radius: 0.35rem;
  font-weight: normal;
`;

const LabelSuccess = styled(Box)`
  width: fit-content;
  padding: 0 4px;
  text-transform: uppercase;
  border-radius: 4px;
  font-size: 8px;
  font-weight: bold;
`

export const ContractDetails = (props: {
  address: string;
  contracts?: AddressDetails | null;
  sourceCode: ISourceCode | null;
  implementation?: AddressDetails | null;
  implementationSourceCode?: ISourceCode | null;
  shard?: ShardID;
}) => {

  if (!!props.sourceCode || (props.implementation && props.implementationSourceCode)) {
    return (
      <VerifiedContractDetails
        sourceCode={props.sourceCode}
        contracts={props.contracts}
        address={props.address}
        shard={props.shard || 0}
        implementation={props.implementation}
        implementationSourceCode={props.implementationSourceCode}
      />
    );
  }

  if (!!props.contracts) {
    return (
      <NoVerifiedContractDetails
        contracts={props.contracts}
        address={props.address}
        shard={props.shard || 0}
      />
    );
  }

  return null;
};

export const AbiMethods = (props: {
  address: string;
  abi: AbiItem[];
  metamaskAddress?: string;
  isRead?: boolean;
  validChainId?: boolean;
}) => {
  return (
    <Box>
      {props.abi.map((abiMethod, idx) =>
        abiMethod.name ? (
          <AbiMethodsView
            key={idx}
            abiMethod={abiMethod}
            address={props.address}
            index={idx}
            metamaskAddress={props.metamaskAddress}
            isRead={props.isRead}
            validChainId={props.validChainId}
          />
        ) : null
      )}
    </Box>
  );
};

export const VerifiedButMissingImplementation = (props: {
  address: string;
  shard: number;
}) => {
  const history = useHistory();

  return (
    <Box style={{ padding: "10px" }}>
      <Box direction="column" gap="30px">
        <Box direction="row" gap="5px">
          Proxy Implementation contract
          <Text
            size="small"
            style={{ cursor: "pointer" }}
            onClick={() =>
              history.push(`/address/${props.address}`)
            }
            color="brand"
          >
            {props.address}
          </Text>
          is not verified. Are you the contract creator?
          <Text
            size="small"
            style={{ cursor: "pointer" }}
            onClick={() =>
              history.push(`/verifycontract?address=${props.address}&shard=${props.shard}`)
            }
            color="brand"
          >
            Verify and Publish
          </Text>
          your contract source code today!
        </Box>
      </Box>
    </Box>
  );
};

export const ProxyContractDetails = (props: {
  address: string;
  proxy: any;
}) => {
  const history = useHistory();

  return (
    <Box style={{ padding: "10px" }}>
      <Box direction="column">
        <Box direction="row" gap="5px">
          ABI for the implementation contract at
          <Text
            size="small"
            style={{ cursor: "pointer" }}
            onClick={() =>
              history.push(`/address/${props.address}?activeTab=7`)
            }
            color="brand"
          >
            {props.address}
          </Text>
        </Box>
        {
          props.proxy?.isBeacon && <Box direction="row" gap="5px">
          Upgradeable Beacon contract at
          <Text
            size="small"
            style={{ cursor: "pointer" }}
            onClick={() =>
              history.push(`/address/${props?.proxy.beaconAddress}?activeTab=7`)
            }
            color="brand"
          >
            {props?.proxy.beaconAddress}
          </Text>
        </Box>
        }
      </Box>
    </Box>
  );
};

export const NoVerifiedContractDetails = (props: {
  contracts: AddressDetails;
  address: string;
  shard: number;
}) => {
  const history = useHistory();

  return (
    <Box style={{ padding: "10px" }} margin={{ top: "medium" }}>
      <Box direction="column" gap="30px">
        <Box direction="row" gap="5px">
          Are you the contract creator?
          <Text
            size="small"
            style={{ cursor: "pointer" }}
            onClick={() =>
              history.push(`/verifycontract?address=${props.address}&shard=${props.shard}`)
            }
            color="brand"
          >
            Verify and Publish
          </Text>
          your contract source code today!
        </Box>

        <Box direction="column">
          <Item
            label="Solidity version"
            value={props.contracts.solidityVersion}
          />
          {props.contracts.IPFSHash ? (
            <Item label="IPFS hash" value={props.contracts.IPFSHash} />
          ) : null}
          <Item
            label="Bytecode"
            value={
              <StyledTextArea readOnly={true} rows={15} cols={100} value={props.contracts.bytecode || ""} />
            }
          />
        </Box>
      </Box>
    </Box>
  );
};

enum V_TABS {
  CODE = "Code",
  READ = "Read Contract",
  WRITE = "Write Contract",
  READ_PROXY = "Read as Proxy",
  WRITE_PROXY = "Write as Proxy",
}

const TabBox = styled(Box) <{ selected: boolean }>`
  border: 1px solid ${(props) => props.theme.global.colors.border};
  background: ${(props) =>
    props.selected ? props.theme.global.colors.backgroundBack : "transparent"};
  padding: 7px 12px 6px 12px;
  border-radius: 4px;
  margin: 5px 10px;
`;

const TabButton = (props: {
  text?: string;
  onClick: () => void;
  selected: boolean;
  children?: any;
}) => {
  return (
    <TabBox onClick={props.onClick} selected={props.selected}>
      {props.text &&
          <Text size="small" color={"minorText"}>
            {props.text}
          </Text>
      }
      {props.children && props.children}
    </TabBox>
  );
};

export const VerifiedContractDetails = (props: {
  sourceCode: ISourceCode | null;
  address: string;
  contracts?: AddressDetails | null;
  shard: number;
  implementation?: AddressDetails | null;
  implementationSourceCode?: ISourceCode | null;
}) => {
  const [tab, setTab] = useState<V_TABS>(V_TABS.CODE);
  const [metamaskAddress, setMetamask] = useState("");
  const [chainId, setChainId] = useState(0);

  let abiString = "";

  const isMainNet =
    process.env.REACT_APP_RPC_URL_SHARD0 === "https://a.api.s0.t.hmny.io/";

  const validChainId = isMainNet
    ? chainId === 1666600000
    : (chainId === 1666700000 || chainId === 1666900000);

  try {
    abiString = JSON.stringify(props.sourceCode?.abi, null, 4);
  } catch { }

  return (
    <Box direction="column">
      {props.sourceCode?.proxyAddress && !props.sourceCode?.proxy && <VerifiedButMissingImplementation address={props.sourceCode.proxyAddress} shard={props.shard}/>}
      <Box direction="row" align="center" margin={{ top: props.sourceCode?.proxyAddress && !props.sourceCode?.proxy ? "" : "medium" }}>
        <TabButton
          text={V_TABS.CODE}
          onClick={() => setTab(V_TABS.CODE)}
          selected={tab === V_TABS.CODE}
        />
        <>
          <TabButton
              text={V_TABS.READ}
              onClick={() => setTab(V_TABS.READ)}
              selected={tab === V_TABS.READ}
          />
          <TabButton
              text={V_TABS.WRITE}
              onClick={() => setTab(V_TABS.WRITE)}
              selected={tab === V_TABS.WRITE}
          />
        </>
        {/*{props.sourceCode.proxyAddress && props.sourceCode.proxy  ? (*/}
        {/*  <>*/}
        {/*    <TabButton*/}
        {/*      text={V_TABS.READ_PROXY + "(new)"}*/}
        {/*      onClick={() => setTab(V_TABS.READ_PROXY)}*/}
        {/*      selected={tab === V_TABS.READ_PROXY}*/}
        {/*    />*/}
        {/*    <TabButton*/}
        {/*      text={V_TABS.WRITE_PROXY + "(new)"}*/}
        {/*      onClick={() => setTab(V_TABS.WRITE_PROXY)}*/}
        {/*      selected={tab === V_TABS.WRITE_PROXY}*/}
        {/*    />*/}
        {/*  </>*/}
        {/*) : null}*/}

        {props.implementation && props.implementationSourceCode  ? (
            <>
              <TabButton
                  onClick={() => setTab(V_TABS.READ_PROXY)}
                  selected={tab === V_TABS.READ_PROXY}>
                <Box direction={'row'} gap={'4px'}>
                  <Text size={'small'} color={'minorText'}>{V_TABS.READ_PROXY}</Text>
                  <LabelSuccess color={'text'} background={'backgroundSuccess'}>new</LabelSuccess>
                </Box>
              </TabButton>
              <TabButton
                  onClick={() => setTab(V_TABS.WRITE_PROXY)}
                  selected={tab === V_TABS.WRITE_PROXY}>
                <Box direction={'row'} gap={'4px'}>
                  <Text size={'small'} color={'minorText'}>{V_TABS.WRITE_PROXY}</Text>
                  <LabelSuccess color={'text'} background={'backgroundSuccess'}>new</LabelSuccess>
                </Box></TabButton>
            </>
        ) : null}

      </Box>
      {tab === V_TABS.CODE && props.sourceCode ? (
        <Box style={{ padding: "10px" }} margin={{ top: "medium" }}>
          <Box direction="column" gap="30px">
            <Box direction="column">
              <Item
                label="Contract Name"
                value={props.sourceCode.contractName}
              />
              <Item
                label="Compiler Version"
                value={props.sourceCode.compiler}
              />
              <Item
                label="Optimization Enabled"
                value={
                  props.sourceCode.optimizer ||
                  "No" +
                  (Number(props.sourceCode.optimizerTimes)
                    ? ` with ${props.sourceCode.optimizerTimes} runs`
                    : "")
                }
              />
              {props.sourceCode.sourceCode && (!props.sourceCode.supporting || props.sourceCode.supporting.length === 0) &&
                <Item
                  label="Contract Source Code Verified"
                  value={
                    <StyledTextArea readOnly={true} rows={15} cols={100} value={props.sourceCode.sourceCode || ""} />
                  }
                />}
              {props.sourceCode.supporting?.sources
                &&
                Object.keys(props.sourceCode.supporting?.sources).map((source: string, i: number) => {
                  return <Item
                    key={i}
                    label={`Verified ${source.substring(source.lastIndexOf('/') + 1)}`}
                    value={
                      <StyledTextArea readOnly={true} rows={15} cols={100} value={props.sourceCode?.supporting.sources[source].source || ""} />
                    }
                  />
                })}
              {props.sourceCode.supporting
                && !props.sourceCode.supporting?.sources
                &&
                Object.keys(props.sourceCode.supporting).map((source: string, i: number) => {
                  return <Item
                    key={i}
                    label={`Verified ${source.substring(source.lastIndexOf('/') + 1)}`}
                    value={
                      <StyledTextArea readOnly={true} rows={15} cols={100} value={props.sourceCode?.supporting[source].source || ""} />
                    }
                  />
                })}
              <Item
                label="ABI"
                value={
                  <StyledTextArea readOnly={true} rows={15} cols={100}>
                    {abiString || ""}
                  </StyledTextArea>
                }
              />
              {props.sourceCode.constructorArguments ? (
                <Item
                  label="Constructor Arguments (ABI-encoded)"
                  value={
                    <StyledTextArea readOnly={true} rows={4} cols={100}>
                      {props.sourceCode.constructorArguments || ""}
                    </StyledTextArea>
                  }
                />
              ) : null}
              {props.contracts ? (
                <Item
                  label="Bytecode"
                  value={
                    <StyledTextArea readOnly={true} rows={7} cols={100}>
                      {props.contracts.bytecode || ""}
                    </StyledTextArea>
                  }
                />
              ) : null}
            </Box>
          </Box>
        </Box>
      ) : null}

      {tab === V_TABS.CODE && !props.sourceCode && props.contracts && <NoVerifiedContractDetails contracts={props.contracts} address={props.address} shard={props.shard} />}

      {tab === V_TABS.READ ? (
          (props.sourceCode && props.sourceCode.abi) ? <Box style={{ padding: "10px" }} margin={{ top: "medium" }}>
            <AbiMethods
                abi={props.sourceCode?.abi?.filter(
                    (a) => a.stateMutability === "view" && a.type === "function"
                )}
                address={props.address}
                isRead={V_TABS.READ === tab}
            />
          </Box> : <Box style={{ padding: "10px" }} margin={{ top: "medium" }}>
            Sorry, there are no available Contract ABI methods to read. Unable to read contract info.
          </Box>
      ) : null}

      {tab === V_TABS.WRITE ? (
          (props.sourceCode && props.sourceCode.abi) ? <Box style={{ padding: "10px" }} margin={{ top: "medium" }}>
          <Wallet onSetMetamask={setMetamask} onSetChainId={setChainId} />
          <AbiMethods
            abi={props.sourceCode.abi.filter(
              (a) =>
                a.stateMutability !== "view" &&
                !!a.name &&
                a.type === "function"
            )}
            address={props.address}
            metamaskAddress={metamaskAddress}
            validChainId={validChainId}
          />
        </Box> : <Box style={{ padding: "10px" }} margin={{ top: "medium" }}>
        Sorry, there are no available Contract ABI methods to write. Unable to write contract info.
      </Box>
      ) : null}

      {tab === V_TABS.READ_PROXY && props.implementation?.address && props.implementationSourceCode?.abi  ? (
          <Box style={{ padding: "10px" }} margin={{ top: "xsmall" }} gap={'16px'}>
            <Box direction={'row'} align={'center'} gap={'4px'}>
              <Text size={'small'}>ABI for the implementation contract at</Text>
              <Address address={props.implementation?.address} hideCopyBtn={true} />
            </Box>
            <AbiMethods
                abi={props.implementationSourceCode?.abi.filter(
                    (a) => a.stateMutability === "view" && a.type === "function"
                )}
                address={props.implementation?.address}
                isRead={V_TABS.READ_PROXY === tab}
            />
          </Box>
      ) : null}

      {tab === V_TABS.WRITE_PROXY && props.implementation?.address && props.implementationSourceCode?.abi ? (
          <Box style={{ padding: "10px" }} margin={{ top: "xsmall" }} gap={'16px'}>
            <Box direction={'row'} align={'center'} gap={'4px'}>
              <Text size={'small'}>ABI for the implementation contract at</Text>
              <Address address={props.implementation?.address} hideCopyBtn={true} />
            </Box>
            <Wallet onSetMetamask={setMetamask} onSetChainId={setChainId} />
            <AbiMethods
                abi={props.implementationSourceCode?.abi.filter(
                    (a) =>
                        a.stateMutability !== "view" &&
                        !!a.name &&
                        a.type === "function"
                )}
                address={props.implementation?.address}
                metamaskAddress={metamaskAddress}
                validChainId={validChainId}
            />
          </Box>
      ) : null}

      {/*{tab === V_TABS.READ_PROXY && props.sourceCode.proxy ? (*/}
      {/*  <Box style={{ padding: "10px" }}>*/}
      {/*    <ProxyContractDetails address={props.sourceCode.proxyAddress || ""} proxy={props.sourceCode.proxyDetails}></ProxyContractDetails>*/}
      {/*    <AbiMethods*/}
      {/*      abi={props.sourceCode.proxy.result.abi.filter(*/}
      {/*        (a: { stateMutability: string; type: string; }) => a.stateMutability === "view" && a.type === "function"*/}
      {/*      )}*/}
      {/*      address={props.address || ""}*/}
      {/*      isRead={V_TABS.READ_PROXY === tab}*/}
      {/*    />*/}
      {/*  </Box>*/}
      {/*) : null}*/}

      {/*{tab === V_TABS.WRITE_PROXY && props.sourceCode.proxy ? (*/}
      {/*  <Box style={{ padding: "10px" }}>*/}
      {/*    <Wallet onSetMetamask={setMetamask} onSetChainId={setChainId} />*/}
      {/*    <ProxyContractDetails address={props.sourceCode.proxyAddress || ""} proxy={props.sourceCode.proxyDetails}></ProxyContractDetails>*/}
      {/*    <AbiMethods*/}
      {/*      abi={props.sourceCode.proxy.result.abi.filter(*/}
      {/*        (a: { stateMutability: string; name: any; type: string; }) =>*/}
      {/*          a.stateMutability !== "view" &&*/}
      {/*          !!a.name &&*/}
      {/*          a.type === "function"*/}
      {/*      )}*/}
      {/*      address={props.address || ""}*/}
      {/*      metamaskAddress={metamaskAddress}*/}
      {/*      validChainId={validChainId}*/}
      {/*    />*/}
      {/*  </Box>*/}
      {/*) : null}*/}
    </Box>
  );
};

// 1. get implementation address of the proxy
// 2. look up when they TAB to the READ or WRITE PROXY. get the source code (fetchContractSource)
// 3. supply as props and enable the read/write proxy code ()
