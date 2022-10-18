export const onClickSelectFile = (fileSelector) => {
  const inputFileElement = fileSelector.querySelector("input[type=file]");
  inputFileElement.click();
}