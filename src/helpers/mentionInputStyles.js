export default {
  color : "white",
  borderColor : "#0D1117",
  borderRadius : "1px",
  input: {
    borderRadius : "1px",
    overflow: 'auto',
    height : "125px",
    width: "80vw",
    border: "none",
    outline: "none",
    borderStyle: "none",
    borderColor: "Transparent",
  },
  highlighter: {
    borderColor : "#0D1117",
  },
  control: {
    backgroundColor: '#0D1117',
    fontSize: 16,
    borderColor : "#0D1117",
    height : "120px",
    border : 0,
    outline: 0,
    width: "80vw",
    // fontWeight: 'normal',
  },
  suggestions: {
    borderRadius : "10px",
    list: {
      borderRadius : "10px",
      backgroundColor: 'gray',
      border: '1px solid rgba(0,0,0,0.15)',
      fontSize: 16,
    },
    item: {
      borderRadius : "10px",
      padding: '5px 15px',
      borderBottom: '1px solid rgba(0,0,0,0.15)',
      '&focused': {
        backgroundColor: '#000000',
      },
    },
  },
}