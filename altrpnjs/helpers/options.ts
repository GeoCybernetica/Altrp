const options = (model, values) => {
  return model.map((page) => {
    return {
      value: page[values.value],
      label: page[values.label]
    }
  })
}

export default options
