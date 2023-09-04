/**
 * Returns the id of the CustomerSuccess with the most customers
 * @param {array} customerSuccess
 * @param {array} customers
 * @param {array} customerSuccessAway
 */
function customerSuccessBalancing(
  customerSuccess,
  customers,
  customerSuccessAway
) {
  const availableCss = findAvailableCustomerSuccess(customerSuccess, customerSuccessAway);

  if (availableCss.length === 0 || customers.length === 0) {
    return 0;
  }

  const {numberOfCustomersByCss, cssWithMostCustomers} = customersAssignment(availableCss, customers);

  if(isCustomersCountTie(numberOfCustomersByCss, cssWithMostCustomers.count)){
    return 0;
  }

  return cssWithMostCustomers.id;
}

/**
 * Returns an object with the result for customers assignment
 * @param {array} customerSuccess
 * @param {array} unassignedCustomers
 */
function customersAssignment(customerSuccess, customers){
  const cssWithMostCustomers   = {id: 0, count : 0};
  const numberOfCustomersByCss = [];
  let availableCss             = customerSuccess;
  let unassignedCustomers      = customers;

  while(unassignedCustomers.length >= cssWithMostCustomers.count && availableCss.length > 0){
    const qualifiedCss = getMinimallyQualifiedCustomerSuccess(availableCss,unassignedCustomers);

    if(qualifiedCss.length == 0){
      break;
    }

    const {
      newlyAssignedCustomersCount,
      newCssWithMostCustomers,
      updatedAvailableCss,
      updatedUnassignedCustomers
    } = getUpdatedCustomerAssignment(qualifiedCss, unassignedCustomers, cssWithMostCustomers)

    numberOfCustomersByCss.push(newlyAssignedCustomersCount);
    unassignedCustomers        = updatedUnassignedCustomers;
    availableCss               = updatedAvailableCss;
    cssWithMostCustomers.id    = newCssWithMostCustomers.id;
    cssWithMostCustomers.count = newCssWithMostCustomers.count;
  }

  return{
    numberOfCustomersByCss,
    cssWithMostCustomers
  };
}

/**
 * Returns an object with the updated information for the customer assignment
 * @param {array} qualifiedCss
 * @param {array} unassignedCustomers
 * @param {object} cssWithMostCustomers
 */
function getUpdatedCustomerAssignment(qualifiedCss, unassignedCustomers, cssWithMostCustomers){
  const lowestQualifiedCss          = getElementLowestScore(qualifiedCss);
  const updatedAvailableCss         = removeElementById(qualifiedCss, lowestQualifiedCss.id);
  const updatedUnassignedCustomers  = updateUnassignedCustomers(unassignedCustomers, lowestQualifiedCss);
  const newlyAssignedCustomersCount = calculateNewlyAssignedCustomersCount(unassignedCustomers, updatedUnassignedCustomers);
  const newCssWithCustomersCount    = {id: lowestQualifiedCss.id, count : newlyAssignedCustomersCount};
  const newCssWithMostCustomers     = getCssWithTheHighestCustomerCount(newCssWithCustomersCount, cssWithMostCustomers);

  return {
    newlyAssignedCustomersCount,
    newCssWithMostCustomers,
    updatedAvailableCss,
    updatedUnassignedCustomers
  };
}

/**
 * Returns the css with highest customers count
 * @param {object} newCssWithCustomersCount
 * @param {object} cssWithMostCustomersCount
 */
function getCssWithTheHighestCustomerCount(newCssWithCustomersCount, cssWithMostCustomers) {
  const highest = cssWithMostCustomers;
  if(newCssWithCustomersCount.count > cssWithMostCustomers.count){
    highest.count = newCssWithCustomersCount.count;
    highest.id    = newCssWithCustomersCount.id;
  }
  return highest;
}

/**
 * Returns true or false for tie validation
 * @param {array} customerSuccess
 * @param {number} cssWithMostCustomersCount
 */
function isCustomersCountTie(customerSuccess, cssWithMostCustomersCount) {
  const cssWithMostCustomersCountIndex =  customerSuccess.indexOf(cssWithMostCustomersCount);
  customerSuccess.splice(cssWithMostCustomersCountIndex, 1);

  return customerSuccess.includes(cssWithMostCustomersCount);
}

/**
 * Returns an array containing only CustomerSuccess that is not away
 * @param {array} customerSuccess
 * @param {array} customerSuccessAway
 */
function findAvailableCustomerSuccess(customerSuccess, customerSuccessAway) {
  return customerSuccess.filter((cs) => !customerSuccessAway.includes(cs.id) );
}

/**
 * Returns the element with the lowest score
 * @param {array} cssOrCustomer
 */
function getElementLowestScore(cssOrCustomer){
  return cssOrCustomer.reduce((prev, curr) => prev.score < curr.score ? prev : curr);
}

/**
 * Returns an array containing only CustomerSuccess with score equal or above lowest score customer
 * @param {array} availableCss
 * @param {array} unassignedCustomers
 */
function getMinimallyQualifiedCustomerSuccess(availableCss, unassignedCustomers){
  const lowestScoreCustomer = getElementLowestScore(unassignedCustomers);
  return availableCss.filter((cs)=> cs.score >= lowestScoreCustomer.score);
}

/**
 * Returns the elements of an array that does not have the specified id
 * @param {array} array
 * @param {number} id
 */
function removeElementById(array, id){
  return array.filter((cs)=> cs.id != id);
}

/**
 * Returns an array containing updated unassigned customers
 * @param {array} customers
 * @param {object} customerSuccess
 */
function updateUnassignedCustomers(customers, customerSuccess){
  return customers.filter((customer)=> customer.score > customerSuccess.score);
}

/**
 * Returns the number of assigned customers
 * @param {array} customers
 * @param {array} remainingCustomers
 */
function calculateNewlyAssignedCustomersCount(customers, remainingCustomers){
  return customers.length - remainingCustomers.length;
}

test("Scenario 1", () => {
  const css = [
    { id: 1, score: 60 },
    { id: 2, score: 20 },
    { id: 3, score: 95 },
    { id: 4, score: 75 },
  ];
  const customers = [
    { id: 1, score: 90 },
    { id: 2, score: 20 },
    { id: 3, score: 70 },
    { id: 4, score: 40 },
    { id: 5, score: 60 },
    { id: 6, score: 10 },
  ];
  const csAway = [2, 4];

  expect(customerSuccessBalancing(css, customers, csAway)).toEqual(1);
});

function buildSizeEntities(size, score) {
  const result = [];
  for (let i = 0; i < size; i += 1) {
    result.push({ id: i + 1, score });
  }
  return result;
}

function mapEntities(arr) {
  return arr.map((item, index) => ({
    id: index + 1,
    score: item,
  }));
}

function arraySeq(count, startAt){
  return Array.apply(0, Array(count)).map((it, index) => index + startAt);
}

test("Scenario 2", () => {
  const css = mapEntities([11, 21, 31, 3, 4, 5]);
  const customers = mapEntities([10, 10, 10, 20, 20, 30, 30, 30, 20, 60]);
  const csAway = [];

  expect(customerSuccessBalancing(css, customers, csAway)).toEqual(0);
});

test("Scenario 3", () => {
  const testTimeoutInMs = 100;
  const testStartTime = new Date().getTime();

  const css = mapEntities(arraySeq(999, 1));
  const customers = buildSizeEntities(10000, 998);
  const csAway = [999];

  expect(customerSuccessBalancing(css, customers, csAway)).toEqual(998);

  if (new Date().getTime() - testStartTime > testTimeoutInMs) {
    throw new Error(`Test took longer than ${testTimeoutInMs}ms!`);
  }
});

test("Scenario 4", () => {
  const css = mapEntities([1, 2, 3, 4, 5, 6]);
  const customers = mapEntities([10, 10, 10, 20, 20, 30, 30, 30, 20, 60]);
  const csAway = [];

  expect(customerSuccessBalancing(css, customers, csAway)).toEqual(0);
});

test("Scenario 5", () => {
  const css = mapEntities([100, 2, 3, 6, 4, 5]);
  const customers = mapEntities([10, 10, 10, 20, 20, 30, 30, 30, 20, 60]);
  const csAway = [];

  expect(customerSuccessBalancing(css, customers, csAway)).toEqual(1);
});

test("Scenario 6", () => {
  const css = mapEntities([100, 99, 88, 3, 4, 5]);
  const customers = mapEntities([10, 10, 10, 20, 20, 30, 30, 30, 20, 60]);
  const csAway = [1, 3, 2];

  expect(customerSuccessBalancing(css, customers, csAway)).toEqual(0);
});

test("Scenario 7", () => {
  const css = mapEntities([100, 99, 88, 3, 4, 5]);
  const customers = mapEntities([10, 10, 10, 20, 20, 30, 30, 30, 20, 60]);
  const csAway = [4, 5, 6];

  expect(customerSuccessBalancing(css, customers, csAway)).toEqual(3);
});

test("Scenario 8", () => {
  const css = mapEntities([60, 40, 95, 75]);
  const customers = mapEntities([90, 70, 20, 40, 60, 10]);
  const csAway = [2, 4];
  expect(customerSuccessBalancing(css, customers, csAway)).toEqual(1);
});
