import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import {
  autocompletion,
  type CompletionContext,
  type CompletionResult
} from '@codemirror/autocomplete';
import { ViewUpdate } from '@codemirror/view';

function myCompletions(context: CompletionContext): CompletionResult | null {
  const word = context.matchBefore(/\w*/);
  if (word && word.from == word.to && !context.explicit) return null;
  return {
    from: word ? word.from : context.pos,
    filter: true,
    options: [
      { label: 'M <x> <y>' },
      { label: 'm <dx> <dy>' },
      { label: 'L <x> <y>' },
      { label: 'l <dx> <dy>' },
      { label: 'H <x>' },
      { label: 'h <dx>' },
      { label: 'V <y>' },
      { label: 'v <dy>' },
      { label: 'C <x1> <y1> <x2> <y2> <x> <y>' },
      { label: 'c <dx1> <dy1> <dx2> <dy2> <dx> <dy>' },
      { label: 'S <x2> <y2> <x> <y>' },
      { label: 's <dx2> <dy2> <dx> <dy>' },
      { label: 'Q <x1> <y1> <x> <y>' },
      { label: 'q <dx1> <dy1> <dx> <dy>' },
      { label: 'T <x> <y>' },
      { label: 't <dx> <dy>' },
      { label: 'A <rx> <ry> <angle> <large-arc-flag> <sweep-flag> <x> <y>' },
      { label: 'a <rx> <ry> <angle> <large-arc-flag> <sweep-flag> <dx> <dy>' },
      { label: 'Z' },
      { label: 'z' }
    ]
  };
}

const theme = EditorView.theme({
  '.cm-content': {
    caretColor: 'white'
  }
});

export interface EditorOptions {
  parent: Element;
  onChange: (update: ViewUpdate) => void;
  initialValue: string;
}

export const createEditor = ({ parent, onChange, initialValue }: EditorOptions) => {
  const view = new EditorView({
    state: EditorState.create({
      doc: initialValue,
      extensions: [
        EditorView.updateListener.of((update) => {
          onChange(update);
        }),
        EditorView.domEventHandlers({}),
        basicSetup,
        theme,
        autocompletion({
          override: [myCompletions]
        })
      ]
    }),
    parent
  });
  return view;
};
