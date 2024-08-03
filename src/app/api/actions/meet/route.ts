import { DEFAULT_SOL_ADDRESS, DEFAULT_SOL_AMOUNT } from "@/utils/const";
import validatedQueryParams from "@/utils/validateParams";
import {
    ActionPostResponse,
    ACTIONS_CORS_HEADERS,
    createPostResponse,
    MEMO_PROGRAM_ID,
    ActionGetResponse,
    ActionPostRequest,
} from "@solana/actions";
import {
    clusterApiUrl,
    Connection,
    LAMPORTS_PER_SOL,
    PublicKey,
    SystemProgram,
    Transaction,
    TransactionInstruction,
} from "@solana/web3.js";





export const GET = async (req: Request) => {

    try {
        const requestUrl = new URL(req.url);
        const baseHref = new URL(
            `/api/actions/meet`,
            requestUrl.origin
        ).toString();

        const payload: ActionGetResponse = {
            title: "Schedule a meet on-chain",
            icon: "https://avatars.githubusercontent.com/u/113763427?v=4",
            description:
                "Schedule a request for meet with Adarsh using Solana via Blinks.",
            label: "Book",
            links:
            {
                actions: [
                    {
                        label: "Book",
                        href: `${baseHref}?name={name}&dateAndTime={dateAndTime}&scheduleMeetLink={scheduleMeetLink}&description={description}`,
                        parameters: [
                            {
                                name: "name",
                                label: "Name",
                                required: true,
                            },
                            {
                                name: "dateAndTime",
                                label: "Date and Time",
                                required: true,
                            },
                            {
                                name: "scheduleMeetLink",
                                label: "Schedule Meet Link",
                                required: true,
                            },
                            {
                                name: "description",
                                label: "Description",
                                required: true,
                            },
                        ],
                    },
                ],
            }
        };

        return Response.json(payload, {
            headers: ACTIONS_CORS_HEADERS,
        });

    } catch (err) {

        console.log(err);
        let message = "An unknown error occurred";

        if (typeof err == "string") message = err;

        return new Response(message, {
            status: 400,
            headers: ACTIONS_CORS_HEADERS,
        });
    }
};


// DO NOT FORGET TO INCLUDE THE `OPTIONS` HTTP METHOD
// THIS WILL ENSURE CORS WORKS FOR BLINKS
export const OPTIONS = GET;


export const POST = async (req: Request) => {
    try {
        const requestUrl = new URL(req.url);
        const { name, dateAndTime, scheduleMeetLink, description } = validatedQueryParams(
            requestUrl
        );

        const body: ActionPostRequest = await req.json();

        // validate the client provided input
        let fromPubkey: PublicKey;
        try {
            fromPubkey = new PublicKey(body.account);
        } catch (err) {
            return new Response('Invalid "from" provided', {
                status: 400,
                headers: ACTIONS_CORS_HEADERS,
            });
        }

        const toPubkey = new PublicKey(DEFAULT_SOL_ADDRESS);
        const connection = new Connection(
            process.env.SOLANA_RPC! || clusterApiUrl("testnet")
        );

        // ensure the receiving account will be rent exempt
        const minimumBalance = await connection.getMinimumBalanceForRentExemption(
            0 // note: simple accounts that just store native SOL have `0` bytes of data
        );
        if (DEFAULT_SOL_AMOUNT * LAMPORTS_PER_SOL < minimumBalance) {
            throw `account may not be rent exempt: ${toPubkey.toBase58()}`;
        }

        const transaction = new Transaction().add(
            // Set transaction compute units
            // ComputeBudgetProgram.setComputeUnitLimit({
            //   units: 30_000,
            // }),
            new TransactionInstruction({
                keys: [{ pubkey: fromPubkey, isSigner: true, isWritable: true }],
                data: Buffer.from(
                    `Schedule meet with ${name} on ${dateAndTime} at ${scheduleMeetLink} with description: ${description}`,
                    "utf8"
                  ),
                programId: new PublicKey(MEMO_PROGRAM_ID),
            }),
            SystemProgram.transfer({
                fromPubkey: fromPubkey,
                toPubkey: toPubkey,
                lamports: DEFAULT_SOL_AMOUNT * LAMPORTS_PER_SOL,
            })
        );

        // set the end user as the fee payer
        transaction.feePayer = fromPubkey;

        transaction.recentBlockhash = (
            await connection.getLatestBlockhash()
        ).blockhash;

        // TODO: Web2 implementation to create user in DB
        console.log(name);

        const payload: ActionPostResponse = await createPostResponse({
            fields: {
                transaction,
                message: `Successfully scheduled a meet with ${name} on ${dateAndTime}.`,
            },
            // note: no additional signers are needed
            // signers: [],
        });

        return Response.json(payload, {
            headers: ACTIONS_CORS_HEADERS,
        });
    } catch (err) {
        console.log(err);
        let message = "An unknown error occurred";
        if (typeof err == "string") message = err;
        return new Response(message, {
            status: 400,
            headers: ACTIONS_CORS_HEADERS,
        });
    }
};




