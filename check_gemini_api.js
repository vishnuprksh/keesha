import { GoogleGenAI } from '@google/genai';

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('Error: GEMINI_API_KEY environment variable not set');
    console.log('Please set the GEMINI_API_KEY environment variable and try again.');
    console.log('Example: GEMINI_API_KEY=your_api_key_here node check_gemini_api.js');
    process.exit(1);
  }

  const ai = new GoogleGenAI({
    apiKey: apiKey,
  });
  const config = {
    temperature: 0,
    thinkingConfig: {
      thinkingBudget: -1,
    },
    responseMimeType: 'text/plain',
    systemInstruction: [
      {
        text: `return SCRICTLY in csv format

convert the text given into the following format

title: Name/description of the transaction (required)
amount: Positive number (required)
fromAccount: Source account name or ID (required)
toAccount: Destination account name or ID (required)
date: Date in YYYY-MM-DD format (required)
description: Additional details (optional)
Available accounts: Ajith (transaction), Akhil Cheppanam (transaction), Electricity-Lakesite (transaction), Entertainment (expense), External (transaction), Family Support (expense), Food (expense), Functions (expense), Grocery (expense), Internet (expense), Loan - Personal (liability), Maid (transaction), Navig8 (transaction), Nizzam (transaction), Rahim (transaction), Rewards (asset), Self Care (expense), SIB (bank), Sreehari (transaction), Sreyas (transaction), Travel (expense), Unknown (transaction), Utilities (expense), Wifi-Lakesite (transaction)`
      }
    ],
  };
  const model = 'gemini-2.5-pro';
  const contents = [
    {
      role: 'user',
      parts: [
        {
          text: `SIBL0000307
STATEMENT OF ACCOUNT FOR THE PERIOD FROM 01-05-2025 TO 31-05-2025
IFSC:
JACOBS BUILDING, GROUND FLOOR
GEETHANJALI JN, NH BY PASS
Ph:0484-2809454,2807455
KERALA
ERNAKULAM
India
682019
MODE OF OPR : SELF
A/C NO : 0307053000000940
CUSTOMER ID : A52878380
DATE: 08-07-2025 PAGE:1
STATEMENT OF ACCOUNT FOR THE PERIOD FROM 01-05-2025 TO 31-05-2025
DATE PARTICULARS CHQ.NO. WITHDRAWALS DEPOSITS BALANCE
VISHNU PRAKASH
KAREETHARA HOUSE
CHEPPANAM PANANGAD P O
ERNAKULAM
KERALA,INDIA
PIN:682506
TYPE : SAVINGS BANK - GSSA
VISHNUCHEPPANAM@GMAIL.COM CURRENCY CODE:INR
01-05-25 UPI/SBIN/RRN-512120878299/JINTU MONI
BHUYAN/UPI 100.00 94,707.50Cr
02-05-25 UPI/KKBK/RRN-548828062899/TUKARAM
DATTATRAY NIGADE/aut 26.00 94,681.50Cr
02-05-25 UPI/HDFC/RRN-104146032484/ASWANI
K/UPI 105.00 94,786.50Cr
02-05-25 UPI/FDRL/RRN-512232317698/SIBINDEV P
S/cable 250.00 94,536.50Cr
02-05-25 UPI/BKID/RRN-512275320771/ABDUL
RAHIM O M/lyricsious 12,000.00 82,536.50Cr
03-05-25 UPI/SBIN/RRN-512361262727/Rahul
Ramasamy/maid may 285.00 82,821.50Cr
03-05-25 UPI/SBIN/RRN512369319570/PRABHAKARAN K C/tank 5,000.00 77,821.50Cr
03-05-25 UPI/CNRB/RRN-548917669745/JINTU MONI
BHUYAN/UPI 582.00 78,403.50Cr
03-05-25 UPI/CNRB/RRN-284298675596/ALTAF
KHAN/Sent from Paytm 1,000.00 79,403.50Cr
03-05-25 UPI/BARB/RRN-512305344537/NATHU LAL
SUTHAR S O KESHU L 510.00 78,893.50Cr
03-05-25 UPI/HDFC/RRN-512379247995/RANJITH C
K/football 180.00 78,713.50Cr
03-05-25 UPI/UTIB/RRN-512391986802/Powai
Darbar/food 204.00 78,509.50Cr
04-05-25 UPI/SBIN/RRN-549096906045/Ajith
Ajayan/transfer 2,000.00 76,509.50Cr
04-05-25 UPI/BARB/RRN-549052108610/SANJAY
GANPAT KANK/auto 30.00 76,479.50Cr
04-05-25 UPI/KKBK/RRN549011213286/SHUJAUDDIN SIRAJUDDIN
ANSARI
60.00 76,419.50Cr
04-05-25 UPI/SBIN/RRN-512468051023/AMAL
MUHAMMED K K/resort 800.00 77,219.50Cr
Page Total : 20,260.00 2,872.00
Page 1 of 7
Visit us at www.southindianbank.com. Br. mail id: BR0307@SIB.CO.IN Customer care toll free number(India) : 1-800-425-1809 (or)1-800-843-1800
77,219.50Cr
... (truncated for brevity) ...`,
        },
      ],
    },
  ];

  const response = await ai.models.generateContentStream({
    model,
    config,
    contents,
  });
  for await (const chunk of response) {
    console.log(chunk.text);
  }
}

main();
