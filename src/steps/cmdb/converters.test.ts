import { CMDBItem } from '../../types';
import { createCMDBEntity } from './converters';

describe('createCMDBEntity', () => {
  test('that properties are converted correctly', () => {
    const data: CMDBItem = ({
      sys_id: 'test-id',
      sys_created_on: '2019-04-05 21:09:12',
      sys_updated_on: '2020-04-05 21:09:12',
      name: 'test-name',
      u_custom_1: 'custom 1',
      u_custom_2: '',
      test_u_custom_3: 'custom 3',
      u_custom_4: undefined,
      u_custom_object: {
        a: 'a',
        b: 'b',
        c: 123,
      },
      u_custom_number: 234,
      u_custom_boolean: true,
    } as unknown) as CMDBItem;

    const entity = createCMDBEntity(data, ['fred', 'george']);
    expect(entity).toMatchSnapshot();
  });
});
