import { newSpecPage } from '@stencil/core/testing';
import { h } from '@stencil/core';
import { QUESTIONNAIRE_VERSION } from '../../global/constants';
import { QUESTIONS } from '../../global/questions';
import { getStorageString } from '../../global/utils/date';
import {
  checkGoTo,
  checkGuard,
  updateScoreData,
} from '../views/questionnaire/utils';
import { QRCode } from './qr-code';

let XMLPrefix = `<PATIENT><V0>${QUESTIONNAIRE_VERSION}</V0>`;
const XMLSuffix = '</PATIENT>';

const mockQuestionAnswers = (answer: string, dateAnswer: string) => {
  let answers = {};
  let score = {};
  let i = 0;
  let x = 0;
  while (i < QUESTIONS.length) {
    const question = QUESTIONS[i];
    switch (question.inputType) {
      case 'radio':
        answers[QUESTIONS[i].id] = answer;
        break;
      case 'date':
        answers[QUESTIONS[i].id] = dateAnswer;
        break;
    }
    score = updateScoreData(i, answer, score);
    i = checkGoTo(i, answer);
    i = checkGuard(i, score);
  }

  return answers;
};

describe('recommendation', () => {
  it('builds', async () => {
    const page = await newSpecPage({
      components: [QRCode],
      template: () => <ia-qr-code />,
    });
    expect(page.rootInstance).toBeTruthy();
  });

  describe('xml generation', () => {
    let summary: QRCode;
    beforeEach(async () => {
      jest.clearAllMocks();
      let page = await newSpecPage({
        components: [QRCode],
        template: () => <ia-qr-code />,
      });
      summary = page.rootInstance;
    });

    it('works', async () => {
      let answers = { P0: '2' };
      expect(summary.generateXML(answers)).toEqual(
        `${XMLPrefix}<P0>3</P0>${XMLSuffix}`
      );
    });

    it('works for the "no" case', async () => {
      let answers = mockQuestionAnswers('1', '');
      const expected = `${XMLPrefix}<P0>2</P0><P2>2</P2><P3>2</P3><P4>2</P4><P5>2</P5><P6>2</P6><C0>2</C0><S0>2</S0><S1>2</S1><S3>2</S3><S4>2</S4><S5>2</S5><S6>2</S6><S7>2</S7><S8>2</S8><S9>2</S9><SA>2</SA><SB>2</SB><SC>2</SC><D0>2</D0><D1>2</D1><D2>2</D2><D3>2</D3><M0>2</M0><M1>2</M1><M2>2</M2>${XMLSuffix}`;
      expect(summary.generateXML(answers)).toEqual(expected);
    });

    it('works for the "yes" case', async () => {
      let answers = mockQuestionAnswers(
        '0',
        getStorageString(new Date('2020-03-31'))
      );
      const expected = `${XMLPrefix}<P0>1</P0><P2>1</P2><P3>1</P3><P4>1</P4><P5>1</P5><P6>1</P6><C0>1</C0><CZ>20200331</CZ><S0>1</S0><S2>1</S2><S3>1</S3><S4>1</S4><S5>1</S5><S6>1</S6><S7>1</S7><S8>1</S8><S9>1</S9><SA>1</SA><SB>1</SB><SC>1</SC><SZ>20200331</SZ><D0>1</D0><D1>1</D1><D2>1</D2><D3>1</D3><M0>1</M0><M1>1</M1><M2>1</M2>${XMLSuffix}`;
      expect(summary.generateXML(answers)).toEqual(expected);
    });
  });
});
