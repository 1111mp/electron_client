import Delta from 'quill-delta';
import { RefObject } from 'react';
import { MemberRepository } from '../memberRepository';

export const matchMention =
  (memberRepositoryRef: RefObject<MemberRepository>) =>
  (node: HTMLElement, delta: Delta): Delta => {
    const memberRepository = memberRepositoryRef.current;

    if (memberRepository) {
      const { title } = node.dataset;

      if (node.classList.contains('module-message-body__at-mention')) {
        const { id } = node.dataset;
        const conversation = memberRepository.getMemberById(
          id ? parseInt(id) : undefined
        );

        if (conversation && conversation.id) {
          return new Delta().insert({
            mention: {
              title,
              id: conversation.id,
            },
          });
        }

        return new Delta().insert(`@${title}`);
      }

      if (node.classList.contains('mention-blot')) {
        const { id } = node.dataset;
        const conversation = memberRepository.getMemberById(
          id ? parseInt(id) : undefined
        );

        if (conversation && conversation.id) {
          return new Delta().insert({
            mention: {
              title:
                title ||
                (conversation.remark
                  ? conversation.remark
                  : conversation.account),
              id: conversation.id,
            },
          });
        }

        return new Delta().insert(`@${title}`);
      }
    }

    return delta;
  };
