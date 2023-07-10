import {Box, Text} from "grommet";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getTokenERC1155AssetDetails,
  getTokenERC721AssetDetails,
} from "src/api/client";
import {IUserERC721Assets} from "src/api/client.interface";
import {Address, BasePage} from "src/components/ui";
import {ERC1155, useERC1155Pool} from "src/hooks/ERC1155_Pool";
import {ERC721, useERC721Pool} from "src/hooks/ERC721_Pool";
import styled from "styled-components";
import HarmonyLogo from '../../assets/Logo.svg';
import { linkedContractsMap, config } from '../../config'
import {ERC1155Icon} from "../../components/ui/ERC1155Icon";
import dayjs from "dayjs";
import {CopyBtn} from "../../components/ui/CopyBtn";
import {convertErc721TokenId, OneCountryTLD} from "../../utils/oneCountry";

const AddressLink = styled.a`
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

interface NFTImageProps {
  imageUrl: string
}

const Image = styled.img`
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  margin-left: auto;
  margin-right: auto;
  border-radius: 0.35rem;
`

const ImageContainer = styled(Box)`
  background-color: #f1f2f3;
  width: 100%;
  border-radius: 0.35rem;
`

const NFTContainer = styled(Box)`
  min-width: 300px;

  @media (min-width: 768px) {
    width: 42%;
  }
`

const DetailsWrapper = styled(Box)`
  margin-top: 32px;
  width: 100%;

  @media (min-width: 768px) {
    margin-top: 0;
    width: 56%;
  }
`

const NFTImage = (props: NFTImageProps) => {
  const { imageUrl } = props

  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingError, setLoadingError] = useState(false)

  const onLoadSuccess = () => {
    setIsLoading(false)
  }

  const onLoadError = () => {
    // setIsLoading(false);
    setLoadingError(true);
  }

  return <ImageContainer width={'inherit'} height={'inherit'} justify={'center'} align={'center'}>
    {isLoading &&
        <Image src={HarmonyLogo} style={{ height: '50%' }} />
    }
    <Image
      src={imageUrl}
      onLoad={onLoadSuccess}
      onError={onLoadError}
      style={{ display: isLoading ? 'none': 'block' }}
    />
  </ImageContainer>
}

interface NFTInfoProps {
  tokenIDParam: string;
  tokenAddressParam: string;
  isLoading: boolean
  tokenERC721: ERC721
  tokenERC1155: ERC1155
  asset: IUserERC721Assets
}

const DetailsProp = styled(Box)`
  width: 30%;
  min-width: 30%;
  max-width: 300px;
`

const DetailsRow = styled(Box)`
  flex-direction: row;
`

const Attribute = styled(Box)`
  width: calc(25% - 16px);
  min-width: 100px;
  border-radius: 12px;
  padding: 16px;
  margin-top: 16px;
  text-align: center;
  
  &:not(:last-child) {
    margin-right: 16px;
  }
`

const TextEllipsis = styled(Text)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-left: 4px;
`

const NotAvailable = 'N/A'
const urlPattern = /([a-zA-Z0-9\-\.]+\.[a-zA-Z]{3,7})|(\n)/g;

const MetaDescription = (props: { text: string, domainParseLinks?: string }) => {
  const { text, domainParseLinks: tld } = props

  if(tld) {
    const richText = text.replace(urlPattern, function(url) {
      const link = 'https://' + url
      return `<a href="${link}" style="color: #00AEE9;">${url}</a>`
    })
    return <div dangerouslySetInnerHTML={{ __html: richText }} />
  }

    return <Box>
      {text}
    </Box>
}

const NFTDetails = (props: NFTInfoProps) => {
  const { tokenAddressParam, tokenIDParam, tokenERC721, asset, isLoading } = props
  const { ownerAddress, tokenID, tokenAddress } = asset

  // const token = tokenERC721 || tokenERC1155 || {}
  const meta = asset.meta || {} as any

  const EmptyValue = isLoading ? '' : NotAvailable
  const tokenStandard = tokenID ? tokenERC721 ? 'ERC721' : 'ERC1155' : EmptyValue

  return <Box round={'8px'} border={{ color: 'border' }} style={{ boxShadow: '0 0.5rem 1.2rem rgb(189 197 209 / 20%)' }}>
    <Box pad={'16px'} border={{ side: 'bottom' }}>
      <Text weight={'bold'}>Details</Text>
    </Box>
    <Box pad={'16px'} border={{ side: 'bottom'}} gap={'16px'}>
      <DetailsRow>
        <DetailsProp>
          <Text size={'small'}>Owner:</Text>
        </DetailsProp>
        <Box>
          {ownerAddress ? <Address address={ownerAddress} /> : EmptyValue}
        </Box>
      </DetailsRow>
      <DetailsRow>
        <DetailsProp>
          <Text size={'small'}>Contract Address:</Text>
        </DetailsProp>
        <Box>
          {tokenAddress ? <Address address={tokenAddress} displayHash /> : EmptyValue}
        </Box>
      </DetailsRow>
      <DetailsRow>
        <DetailsProp>
          <Text size={'small'}>Token ID:</Text>
        </DetailsProp>
        <Box>
          {tokenID
            ? <Box direction={'row'} align={'center'}>
                <CopyBtn
                  value={tokenID}
                  showNotification={true}
                />
                <TextEllipsis size={'small'}>
                  {tokenID}
                </TextEllipsis>
              </Box>
            : EmptyValue}
        </Box>
      </DetailsRow>
      <DetailsRow>
        <DetailsProp>
          <Text size={'small'}>Token Standard:</Text>
        </DetailsProp>
        <Box>
          <Text size={'small'}>{tokenStandard}</Text>
        </Box>
      </DetailsRow>
    </Box>
    <Box pad={'16px'} border={{ side: 'bottom' }}>
      <Text weight={'bold'}>Description</Text>
    </Box>
    <Box pad={'16px'}>
      {asset.meta?.description
        ? <MetaDescription
          text={asset.meta?.description}
          domainParseLinks={tokenAddress === config.oneCountryNFTContractAddress ? OneCountryTLD : ''}
        />
        : EmptyValue
      }
    </Box>
    {meta.attributes &&
      <Box border={{ side: 'top' }}>
          <Box pad={'16px'} border={{ side: 'bottom' }}>
              <Text weight={'bold'}>Attributes</Text>
          </Box>
          <Box pad={'0px 24px 16px'} wrap={true} direction={'row'}>
            {Object.values(meta.attributes).map((attr: any, index: number) => {
              const { trait_type, display_type } = attr

              const value = display_type === 'date'
                ? dayjs(+attr.value).format('MMM DD, YYYY')
                : attr.value
              const valueTitle = display_type === 'date'
                ? dayjs(+attr.value).format('MMM DD, YYYY HH:mm:ss')
                : attr.value

              return <Attribute key={index} border={{ color: 'border' }} background={'backgroundDropdownItem'}>
                <Text size={'small'} color={'brand'} weight={'bold'}>{trait_type}</Text>
                <Text size={'small'} title={valueTitle}>{value}</Text>
              </Attribute>
            })}
          </Box>
      </Box>
    }
  </Box>
}

const NFTInfo = (props: NFTInfoProps) => {
  const { tokenAddressParam, tokenIDParam, tokenERC721, tokenERC1155, asset, isLoading } = props
  const { meta, tokenID } = asset

  const EmptyValue = isLoading ? '' : NotAvailable

  const token = tokenERC721 || tokenERC1155 || {}
  const nameValue = tokenID && token.name
    ? `${token.name} ${meta?.name || ''}`
    : EmptyValue;
  const erc1155Image = tokenERC1155 && tokenERC1155.meta ? tokenERC1155.meta.image : ''

  const linkedContract = linkedContractsMap[tokenAddressParam]
  const linkTokenId = linkedContract && linkedContract.address === config.oneCountryNFTContractAddress
    ? convertErc721TokenId(tokenIDParam)
    : tokenIDParam

  return <Box>
    <Box>
      <Box style={{ minHeight: '28px' }}>
        <Text weight={'bold'} size={'large'}>{nameValue}</Text>
      </Box>
      <Box direction={'row'} align={'center'} gap={'12px'} margin={{ top: '4px' }}>
        <ERC1155Icon imageUrl={erc1155Image} />
        <AddressLink href={`/address/${token.address}`}>
          <Text color={'brand'} size={'small'}>{token.name}</Text>
        </AddressLink>
        {linkedContract &&
          <Box>
            <AddressLink href={`/inventory/${linkedContract.type}/${linkedContract.address}/${linkTokenId}`}>
                <Text color={'brand'} size={'medium'}>Show this NFT on {linkedContract.name} page</Text>
            </AddressLink>
          </Box>
        }
      </Box>
      <Box margin={{ top: '24px' }}>
        <NFTDetails {...props} />
      </Box>
    </Box>
  </Box>
}

export function InventoryDetailsPage() {
  const erc721Map = useERC721Pool();
  const erc1155Map = useERC1155Pool();

  const [inventory, setInventory] = useState<IUserERC721Assets>({} as any);
  const [isLoading, setIsLoading] = useState(false)

  const {
    address = '',
    tokenID = '',
    type = ''
  }: { address: string, tokenID: string, type: string } = useParams();

  const token721 = erc721Map[address]
  const token1155 = erc1155Map[address]

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        if (type === "erc721" || type === "erc1155") {
          let inventoryItem =
            type === "erc721"
              ? await getTokenERC721AssetDetails(address, tokenID)
              : await getTokenERC1155AssetDetails(address, tokenID);
          setInventory(inventoryItem || {});
        }
      } catch (e) {
        console.error('Cannot load token data:', e)
      } finally {
        setIsLoading(false)
      }
    };
    loadData();
  }, [address]);

  const metaImageUrl = inventory && inventory.meta && inventory.meta?.image ? inventory.meta?.image : ''
  const fullImageUrl = metaImageUrl.includes('http') ? metaImageUrl : `${config.ipfsGateway}${metaImageUrl}`

  return (
    <>
      <BasePage>
        <Box direction={'row'} justify={'between'} wrap={true}>
          <NFTContainer>
            <NFTImage imageUrl={fullImageUrl} />
          </NFTContainer>
          <DetailsWrapper>
            <NFTInfo
              tokenAddressParam={address.toLowerCase()}
              tokenIDParam={tokenID}
              isLoading={isLoading}
              tokenERC721={token721}
              tokenERC1155={token1155}
              asset={inventory}
            />
          </DetailsWrapper>
        </Box>
      </BasePage>
    </>
  );
}
