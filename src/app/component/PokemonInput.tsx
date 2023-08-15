import { useState, useCallback, useEffect, useRef } from 'react';
import { useCompletionList } from 'use-completionlist';

export default function PokemonInput() {
  const [ userInput, setUserInput ] = useState('');              // 表示用の値
  const lastUserInput = useRef('');                              // 1つ前の表示用の値
  const [ searchKey, setSearchKey ] = useState('');              // 検索キー
  const [ confirmedValue, setConfirmedValue ] = useState('');    // 選択された値
  const { data, error, loading } = useCompletionList(searchKey); // 候補リスト

  useEffect(() => {
    if (data.length === 1 && userInput.length > lastUserInput.current.length) {
      // キーボード選択用: もし、検索候補が1件しかない場合は先頭一致でその要素が選択されたものとする。表示も更新する。
      setUserInput(String(data[0]));
      lastUserInput.current = String(data[0]);
      setConfirmedValue(String(data[0]));
    } else {
      // キーボード選択用: 正確に一致するものが候補にあればその要素が選択されたものとする
      const found = data.find(v => String(v) === userInput);
      if (found !== undefined) {
        setConfirmedValue(String(found));
      }
    }
  }, [userInput, data])

  const onChange = useCallback(function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    lastUserInput.current = userInput; // 最後の入力をとっておく
    setUserInput(e.target.value);
    if (data.some(v => String(v) === e.target.value)) {
      // マウス選択用: 候補のリストを検索して正確にマッチするものがあったら確定(検索はしない)
      setConfirmedValue(e.target.value);
    } else {
      // キーボード選択用: 正確にマッチするものがなければサーバーに問い合わせて候補リストを最新化
      setSearchKey(e.target.value);
    }
  }, [data]);

  return (
      <div className="App">
        { error ? <div>エラー: {String(error)}</div> : undefined }
        <div>選択された素数: {confirmedValue}</div>
        <label>素数選択: <input type="text" name="example" list="exampleList" value={userInput} onChange={onChange}/></label>
        { loading ? "🌀" : (
            <datalist id="exampleList">
              { data.map(value => (<option key={value} value={value} />))}
            </datalist>
        )}
      </div>
  );
}