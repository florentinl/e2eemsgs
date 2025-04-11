# The ATTACK

## Step 1 – Unchecked file download (browser only)

- pick a request that hits the /api/messages/download/ route, edit and replay the request modifying the `file` attribute to be `../proc/self/environ`
- read the `JWT_SECRET`

## Step 2 – JWT Forgery (jwt.io + browser)

- take your own cookie to [https://jwt.io](https://jwt.io) and paste it there.
- edit the user_id
- edit the secret
- copy the resulting cookie
- set it in your browser
- boom you are connected but non groups or messages because impossible to decrypt them

## Step 3 – Retrieve messages (browser to retrieve messages / download file + )

- hit the /api/messages/ with your impersonated cookie
- notice that the nonce is reused between messages
- notice that an attachment has a known file name (`anssi guide maitre ...` it's gitted here for convenience)
- download the encrypted version of the `anssi guide`
- use xors (see `./attack.py`) to decrypt another message using the same nounce
