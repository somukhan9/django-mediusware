import React, { useState } from 'react'
import TagsInput from 'react-tagsinput'
import 'react-tagsinput/react-tagsinput.css'
import Dropzone from 'react-dropzone'

const CreateProduct = (props) => {
  const [title, setTitle] = useState('')
  const [sku, setSku] = useState('')
  const [description, setDescription] = useState('')
  const [productImages, setProductImages] = useState([])
  // const productImages = []
  const [productImageUrls, setProductImageUrls] = useState([])
  const [productVariantPrices, setProductVariantPrices] = useState([])

  const [productVariants, setProductVariant] = useState([
    {
      option: 1,
      tags: [],
    },
  ])
  console.log(typeof props.variants)
  // handle click event of the Add button
  const handleAddClick = () => {
    let all_variants = JSON.parse(props.variants.replaceAll("'", '"')).map(
      (el) => el.id
    )
    let selected_variants = productVariants.map((el) => el.option)
    let available_variants = all_variants.filter(
      (entry1) => !selected_variants.some((entry2) => entry1 == entry2)
    )
    setProductVariant([
      ...productVariants,
      {
        option: available_variants[0],
        tags: [],
      },
    ])
  }

  // handle input change on tag input
  const handleInputTagOnChange = (value, index) => {
    let product_variants = [...productVariants]
    product_variants[index].tags = value
    setProductVariant(product_variants)

    checkVariant()
  }

  // remove product variant
  const removeProductVariant = (index) => {
    let product_variants = [...productVariants]
    product_variants.splice(index, 1)
    setProductVariant(product_variants)
  }

  // check the variant and render all the combination
  const checkVariant = () => {
    let tags = []

    productVariants.filter((item) => {
      tags.push(item.tags)
    })

    setProductVariantPrices([])

    getCombn(tags).forEach((item) => {
      const existingPrice = productVariantPrices.find(
        (price) => price.title === item
      )
      setProductVariantPrices((productVariantPrice) => [
        ...productVariantPrice,
        {
          title: item,
          price: existingPrice ? existingPrice.price : 0,
          stock: existingPrice ? existingPrice.stock : 0,
        },
      ])
    })
  }

  // combination algorithm
  function getCombn(arr, pre) {
    pre = pre || ''
    if (!arr.length) {
      return pre
    }
    let ans = arr[0].reduce(function (ans, value) {
      return ans.concat(getCombn(arr.slice(1), pre + value + '/'))
    }, [])
    return ans
  }

  // Save product
  let saveProduct = async (event) => {
    event.preventDefault()
    // TODO : write your code here to save the product

    const productData = {
      title,
      sku,
      description,
      variants: productVariants.map((variant) => ({
        option: variant.option,
        tags: variant.tags,
      })),
      prices: productVariantPrices.map((price) => ({
        title: price.title,
        price: price.price,
        stock: price.stock,
      })),
      images: productImages,
    }

    try {
      // console.log(productData)
      const response = await fetch('/product/api/create/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      })

      if (response.ok) {
        // Product saved successfully
        console.log('Product saved successfully')
      } else {
        // Handle error
        console.error('Error saving product')
        const data = await response.json()
        console.log(data)
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <div>
      <section>
        <div className="row">
          <div className="col-md-6">
            <div className="card shadow mb-4">
              <div className="card-body">
                <div className="form-group">
                  <label htmlFor="">Product Name</label>
                  <input
                    type="text"
                    id="product-name"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Product Name"
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="">Product SKU</label>
                  <input
                    type="text"
                    id="product-sku"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="Product SKU"
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="">Description</label>
                  <textarea
                    id="product-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    cols="30"
                    rows="4"
                    className="form-control"
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="card shadow mb-4">
              <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                <h6 className="m-0 font-weight-bold text-primary">Media</h6>
              </div>
              <div className="card-body border">
                <Dropzone
                  onDrop={(acceptedFiles) => {
                    // console.log(acceptedFiles[0])
                    setProductImages((prev) => [...prev, acceptedFiles])
                    // console.log(productImages)
                  }}
                >
                  {({ getRootProps, getInputProps }) => (
                    <section>
                      <div {...getRootProps()}>
                        <input {...getInputProps()} />
                        <p>
                          Drag 'n' drop some files here, or click to select
                          files
                        </p>
                      </div>
                    </section>
                  )}
                </Dropzone>

                {/* Display selected image's path name */}
                {productImages.length > 0 && (
                  <div>
                    <h5>Selected Images:</h5>
                    <ul>
                      {productImages.map((file, index) => (
                        <li key={index}>{file[0].path}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card shadow mb-4">
              <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                <h6 className="m-0 font-weight-bold text-primary">Variants</h6>
              </div>
              <div className="card-body">
                {productVariants.map((element, index) => {
                  return (
                    <div className="row" key={index}>
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="">Option</label>
                          <select
                            className="form-control"
                            defaultValue={element.option}
                          >
                            {JSON.parse(
                              props.variants.replaceAll("'", '"')
                            ).map((variant, index) => {
                              return (
                                <option key={index} value={variant.id}>
                                  {variant.title}
                                </option>
                              )
                            })}
                          </select>
                        </div>
                      </div>

                      <div className="col-md-8">
                        <div className="form-group">
                          {productVariants.length > 1 ? (
                            <label
                              htmlFor=""
                              className="float-right text-primary"
                              style={{ marginTop: '-30px' }}
                              onClick={() => removeProductVariant(index)}
                            >
                              remove
                            </label>
                          ) : (
                            ''
                          )}

                          <section style={{ marginTop: '30px' }}>
                            <TagsInput
                              value={element.tags}
                              style="margin-top:30px"
                              onChange={(value) =>
                                handleInputTagOnChange(value, index)
                              }
                            />
                          </section>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="card-footer">
                {productVariants.length !== 3 ? (
                  <button className="btn btn-primary" onClick={handleAddClick}>
                    Add another option
                  </button>
                ) : (
                  ''
                )}
              </div>

              <div className="card-header text-uppercase">Preview</div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <td>Variant</td>
                        <td>Price</td>
                        <td>Stock</td>
                      </tr>
                    </thead>
                    <tbody>
                      {productVariantPrices.map(
                        (productVariantPrice, index) => {
                          return (
                            <tr key={index}>
                              <td>{productVariantPrice.title}</td>
                              <td>
                                <input className="form-control" type="text" />
                              </td>
                              <td>
                                <input className="form-control" type="text" />
                              </td>
                            </tr>
                          )
                        }
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={saveProduct}
          className="btn btn-lg btn-primary"
        >
          Save
        </button>
        <button type="button" className="btn btn-secondary btn-lg">
          Cancel
        </button>
      </section>
    </div>
  )
}

export default CreateProduct
