import { asym_decrypt, derive_key_pair } from "argon2wasm";
import {
  answerApiAuthLoginAnswerPost,
  challengeApiAuthLoginChallengePost,
  logoutApiAuthLogoutPost,
} from "../api-client";
import type { UseNavigateResult } from "@tanstack/react-router";

export const sendLogin = async (
  username: string,
  password: string,
  onError?: (msg: string) => void,
  onSuccess?: (msg: string) => void
) => {
  const asymKeys = derive_key_pair(password, username);

  let challengeId: number;
  let challengeCipher: string;

  // Request a challenge
  {
    let response = await challengeApiAuthLoginChallengePost({
      body: {
        username: username,
      },
    });

    if (response.error) {
      onError && onError("Internal server error");
      return;
    }

    challengeId = response.data.id!;
    challengeCipher = response.data.challenge;
  }

  // Resolve the challenge
  let challengeAnswer: string;

  try {
    challengeAnswer = asym_decrypt(challengeCipher, asymKeys.private_key);
  } catch {
    onError && onError("Wrong username or password");
    return;
  }

  // Answer a challenge
  {
    let response = await answerApiAuthLoginAnswerPost({
      body: {
        id: challengeId,
        username: username,
        challenge: challengeAnswer,
      },
    });

    if (response.error) {
      if (response.response.status == 403) {
        onError && onError("Wrong username or password");
      } else {
        onError && onError("Internal server error");
      }
      return;
    }

    localStorage.setItem("publicKey", asymKeys.public_key);
    localStorage.setItem("privateKey", asymKeys.private_key);

    onSuccess &&
      onSuccess(
        "Successfully logged in with username " + response.data.username
      );
  }
};

export const logout = async (navigate: UseNavigateResult<string>) => {
  // sendLogout
  {
    let response = await logoutApiAuthLogoutPost({});

    if (response.error) {
      return;
    }

    localStorage.removeItem("publicKey");
    localStorage.removeItem("privateKey");
    navigate({ to: "/login" });
    return;
  }
};
