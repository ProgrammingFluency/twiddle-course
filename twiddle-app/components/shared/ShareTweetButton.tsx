'use client'

import Image from "next/image";

interface Props {
    tweetPath: string;
}

const ShareTweetButton = ({
    tweetPath,
  }: Props) => {
  
      const copyTweetUrl = () => {
          const domain = window.location.origin
          const tweetUrl = domain + tweetPath
          navigator.clipboard.writeText(tweetUrl)
          .then(() => {
              alert('Tweet link is copied to your clipboard, you can share it now with anyone')
          })
          .catch(err => {
              console.error('Failed to copy text: ', err);
          });
      }
  
      return (
          <>
              <Image
                  src='/assets/share.svg' 
                  alt="share" 
                  width={24} 
                  height={24} 
                  className="cursor-pointer object-contain"
                  onClick={copyTweetUrl}
              />     
          </>
      )
  }
  
  export default ShareTweetButton;
  
