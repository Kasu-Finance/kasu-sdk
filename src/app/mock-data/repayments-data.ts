interface Data {
    id: string;
    source: string;
    repaymentDate: string;
    repaymentAmount: string;
  }
  
  const createData = (
    id: string,
    source: string,
    repaymentDate: string,
    repaymentAmount: string
  ): Data => {
    return { id, source, repaymentDate, repaymentAmount };
  };
  
  const repayments: Data[] = [
    createData('1', 'Pool Alpha • Impairment', 'March 1, 2023', '$10.00'),
    createData('1', 'Beta Pool Bepha • Impairment', 'March 2, 2023', '$10.00'),
    createData('1', 'A • Impairment', 'March 2, 2023', '$10.00'),
    createData('2', 'B', 'March 3, 2023', '$9.00'),
    createData('3', 'C Gama', 'March 4, 2022', '$10.00'),
    createData('4', 'Z Alpha', 'March 7, 2023', '$10.00'),
    createData('5', 'S Alpha', 'March 8, 2023', '$10.00'),
    createData('6', 'V Alpha', 'March 9, 2023', '$10.00'),
    createData('7', 'D Alpha', 'March 10, 2023', '$10.00'),
    createData('8', 'E Alpha', 'March 11, 2023', '$10.00'),
    createData('9', 'Q Alpha', 'March 12, 2023', '$10.00'),
    createData('10', 'R Alpha', 'March 13, 2023', '$10.00'),
    createData('11', 'S Alpha', 'March 14, 2023', '$10.00'),
  ];
  
  export default repayments;
  