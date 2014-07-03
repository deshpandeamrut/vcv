var calculatorApp  = angular.module('calculatorApp', []);

//investor comparision Calculator
function investorComparisionCalculator($scope, $http) {
	$scope.mortgageamount = 0;
	$scope.mortgageamount2 = 0;
	$scope.monthlyrepayments = 0;
	$scope.monthlyrepayments2 = 0;
	$scope.investorComparisionFields = {
		"loanterms" : "",
		"houseprice" : "",
		"yourdeposit" : "",
		"estimatedcosts" : "",
		"borrowemarkup" : "",
		"interestrate" : "",
		"borrowemarkup2" : "",
		"interestrate2" : ""
	}

	$scope.investorComparisionValues = function() {
		//Investor 1 Mortgage Amount
		var mortgageAmount  = ((parseFloat($scope.investorComparisionFields.borrowemarkup)/100)*
		parseFloat($scope.investorComparisionFields.houseprice))+
		parseFloat($scope.investorComparisionFields.houseprice)-
		parseFloat($scope.investorComparisionFields.yourdeposit)+
		parseFloat($scope.investorComparisionFields.estimatedcosts);

		$scope.mortgageamount = mortgageAmount;


		//Investor1 monthly payments
		var totalMortgagePayments = parseFloat($scope.investorComparisionFields.loanterms)*12;
		var totalMPval1 = (parseFloat($scope.investorComparisionFields.interestrate)/100)/12;
		var monthlyRepayments = $scope.mortgageamount*((totalMPval1)*Math.pow((1+(totalMPval1)),totalMortgagePayments))/((Math.pow((1+totalMPval1),(totalMortgagePayments)))-1);

		$scope.monthlyrepayments = monthlyRepayments;

		//Investor 2 Mortgage Amount
		var mortgageAmount2  = ((parseFloat($scope.investorComparisionFields.borrowemarkup2)/100)*
		parseFloat($scope.investorComparisionFields.houseprice))+
		parseFloat($scope.investorComparisionFields.houseprice)-
		parseFloat($scope.investorComparisionFields.yourdeposit)+
		parseFloat($scope.investorComparisionFields.estimatedcosts);

		$scope.mortgageamount2 = mortgageAmount2;

		//Investor2 monthly payments
		var totalMPval2 = (parseFloat($scope.investorComparisionFields.interestrate2)/100)/12;
		var monthlyRepayments2 = $scope.mortgageamount2*((totalMPval2)*Math.pow((1+(totalMPval2)),totalMortgagePayments))/((Math.pow((1+totalMPval2),(totalMortgagePayments)))-1);

		$scope.monthlyrepayments2 = monthlyRepayments2;

	}	
}

//investor comparision calculator
function investorProfitCalculator($scope, $http) {
	$scope.borrowermortgageamount = 0;
	$scope.investormortgageamount = 0;
	$scope.borrowermonthlyrepayments = 0;
	$scope.investormonthlyrepayments = 0;
	$scope.borroweryearlyrepayment = 0;
	$scope.investoryearlyrepayment = 0;
	$scope.returninvestment = 0;
	$scope.investmentprofit = 0;
	$scope.borrowerrefinance = 0;
	$scope.mortgageamountdifference = 0;
	$scope.monthlyrepaymentsdifference = 0;
	$scope.yearlyrepaymentdifference = 0;
	$scope.interestratedifference = 0;
	$scope.investorProfitFields = {
		"loanterms" : "",
		"estimatedborrowerrefinance" : "",
		"houseprice" : "",
		"yourdeposit" : "",
		"estimatedcosts" : "",
		"borrowemarkup" : "",
		"interestrate" : "",
		"borrowerdeposit" : "",
		"investormarkup" : "",
		"investorinterestrate" : ""

	}
	$scope.investorProfitValues = function() {
		//Borrower Mortgage Amount
		var borrowermortgageamount  = parseFloat($scope.investorProfitFields.houseprice)+
		((parseFloat($scope.investorProfitFields.borrowemarkup)/100)*
		parseFloat($scope.investorProfitFields.houseprice))-
		parseFloat($scope.investorProfitFields.borrowerdeposit);

		$scope.borrowermortgageamount = borrowermortgageamount.toFixed(2);

		//Borrower monthly payments
		var totalMortgagePayments = parseFloat($scope.investorProfitFields.loanterms)*12;
		var interestRate = parseFloat($scope.investorProfitFields.interestrate)/100;
		$scope.borrowermonthlyrepayments = ($scope.borrowermortgageamount*((interestRate/12)*(Math.pow((1+(interestRate/12)),totalMortgagePayments)))/((Math.pow((1+(interestRate/12)),totalMortgagePayments))-1)).toFixed(2);

		$scope.borroweryearlyrepayment = ($scope.borrowermonthlyrepayments*12).toFixed(2);

		//Investor Mortgage Amount
		var investormortgageamount  = parseFloat($scope.investorProfitFields.houseprice)-
		parseFloat($scope.investorProfitFields.yourdeposit)+
		parseFloat($scope.investorProfitFields.estimatedcosts)-
		parseFloat($scope.investorProfitFields.borrowerdeposit);

		$scope.investormortgageamount = investormortgageamount.toFixed(2);

		//Borrower monthly payments
		var interestRate = parseFloat($scope.investorProfitFields.investorinterestrate)/100;
		$scope.investormonthlyrepayments = ($scope.investormortgageamount*((interestRate/12)*(Math.pow((1+(interestRate/12)),totalMortgagePayments)))/((Math.pow((1+(interestRate/12)),totalMortgagePayments))-1)).toFixed(2);


		$scope.investoryearlyrepayment = ($scope.investormonthlyrepayments*12).toFixed(2);;

		$scope.interestratedifference = parseFloat($scope.investorProfitFields.interestrate)-parseFloat($scope.investorProfitFields.investorinterestrate);
		$scope.mortgageamountdifference = ($scope.borrowermortgageamount - $scope.investormortgageamount).toFixed(2);;
		$scope.monthlyrepaymentsdifference = ($scope.borrowermonthlyrepayments - $scope.investormonthlyrepayments).toFixed(2);;
		$scope.yearlyrepaymentdifference = ($scope.borroweryearlyrepayment - $scope.investoryearlyrepayment).toFixed(2);;
		$scope.returninvestment = (($scope.yearlyrepaymentdifference/parseFloat($scope.investorProfitFields.yourdeposit))*100).toFixed(2);
		$scope.investmentprofit = ($scope.yearlyrepaymentdifference*(parseFloat($scope.investorProfitFields.estimatedborrowerrefinance))).toFixed(2);
		$scope.borrowerrefinance = (parseFloat($scope.investorProfitFields.houseprice)*(parseFloat($scope.investorProfitFields.borrowemarkup)/100)).toFixed(2);

	}	

}

//mortgage comparision calculator
function mortgageComparisionCalculator($scope, $http) {

	$scope.mortgageComparisionFields = {
		"loanterms" : "",
		"houseprice" : "",
		"yourdeposit" : "",
		"investormarkup1" : "",
		"annualinterest1" : "",
		"investormarkup2" : "",
		"annualinterest2" : "",
		"estimatedstamp1" : "",
		"estimatedstamp2" : ""
	}

	$scope.houseSumSc1 = 0;
	$scope.estimatedCostSc1 = 0;
	$scope.mortageamountSc1 = 0;
	$scope.monthlymortgagerepaymentSc1 = 0;
	$scope.yearlymortgagerepaymentSc1 = 0;

	$scope.houseSumSc2 = 0;
	$scope.estimatedCostSc2 = 0;
	$scope.mortageamountSc2 = 0;
	$scope.monthlymortgagerepaymentSc2 = 0;
	$scope.yearlymortgagerepaymentSc2 = 0;

	$scope.mortgageComparisionValues = function() {
		
		$scope.houseSumSc1  = ((parseFloat($scope.mortgageComparisionFields.houseprice)*
			(parseFloat($scope.mortgageComparisionFields.investormarkup1)/100))+parseFloat($scope.mortgageComparisionFields.houseprice)
		).toFixed(2);

		$scope.houseSumSc2  = ((parseFloat($scope.mortgageComparisionFields.houseprice)*
			(parseFloat($scope.mortgageComparisionFields.investormarkup2)/100))+parseFloat($scope.mortgageComparisionFields.houseprice)
		).toFixed(2);

		$scope.estimatedCostSc1 = parseFloat($scope.mortgageComparisionFields.estimatedstamp1).toFixed(2);
		$scope.estimatedCostSc2 = parseFloat($scope.mortgageComparisionFields.estimatedstamp2).toFixed(2);

		$scope.mortageamountSc1 = (parseFloat($scope.estimatedCostSc1)+parseFloat($scope.houseSumSc1)-parseFloat($scope.mortgageComparisionFields.yourdeposit)).toFixed(2);
		$scope.mortageamountSc2 = (parseFloat($scope.estimatedCostSc2)+parseFloat($scope.houseSumSc2)-parseFloat($scope.mortgageComparisionFields.yourdeposit)).toFixed(2);

		var rate1 = (parseFloat($scope.mortgageComparisionFields.annualinterest1)/100)/12;
		var nper =  parseFloat($scope.mortgageComparisionFields.loanterms)*12;
		$scope.monthlymortgagerepaymentSc1 = ($scope.pmt(rate1,nper,-$scope.mortageamountSc1,0,0)).toFixed(2);

		var rate2 = (parseFloat($scope.mortgageComparisionFields.annualinterest2)/100)/12;
		$scope.monthlymortgagerepaymentSc2 = ($scope.pmt(rate2,nper,-$scope.mortageamountSc2,0,0)).toFixed(2);

		$scope.yearlymortgagerepaymentSc1 = (parseFloat($scope.monthlymortgagerepaymentSc1)*12).toFixed(2);
		$scope.yearlymortgagerepaymentSc2 = (parseFloat($scope.monthlymortgagerepaymentSc2)*12).toFixed(2);
	}

	$scope.pmt  = function(rate, nper, pv, fv, type) {
	    if (!fv) fv = 0;
	    if (!type) type = 0;

	    if (rate == 0) return -(pv + fv)/nper;

	    var pvif = Math.pow(1 + rate, nper);
	    var pmt = rate / (pvif - 1) * (-(pv * pvif + fv));
	    return pmt;
  	}	
}

//mortgage vs renting calculator
function mortgageRentingCalculator($scope, $http) {
	$scope.mortgageRentingCalculatorFields = {
		"loanterms" : "",
		"houseprice" : "",
		"yourdeposit" : "",
		"investormarkup" : "",
		"annualinterest" : "",
		"rentPerWeek" : "",
		"capitalGrowth" : "",
		"estimatedstamp" : ""
	}

	$scope.currentRentPerYear = 0;
	$scope.housepriceAndInvestorMarkup = 0;
	$scope.netmortgageamount = 0;
	$scope.monthlymortgageamount = 0;
	$scope.yearlymortgageamount = 0;

	$scope.mortgageRentingValues = function() {
		$scope.currentRentPerYear  = ((parseFloat($scope.mortgageRentingCalculatorFields.rentPerWeek))*52).toFixed(2);
		$scope.housepriceAndInvestorMarkup = ((parseFloat($scope.mortgageRentingCalculatorFields.houseprice)*(parseFloat($scope.mortgageRentingCalculatorFields.investormarkup)/100))+parseFloat($scope.mortgageRentingCalculatorFields.houseprice)).toFixed(2);
		$scope.netmortgageamount = (parseFloat($scope.mortgageRentingCalculatorFields.estimatedstamp)+parseFloat($scope.housepriceAndInvestorMarkup)-parseFloat($scope.mortgageRentingCalculatorFields.yourdeposit)).toFixed(2);

		var rate1 = (parseFloat($scope.mortgageRentingCalculatorFields.annualinterest)/100)/12;
		var nper =  parseFloat($scope.mortgageRentingCalculatorFields.loanterms)*12;
		$scope.monthlymortgageamount = ($scope.pmt(rate1,nper,-$scope.netmortgageamount,0,0)).toFixed(2);

		$scope.yearlymortgageamount = (parseFloat($scope.monthlymortgageamount)*12).toFixed(2);

	}

	$scope.pmt  = function(rate, nper, pv, fv, type) {
	    if (!fv) fv = 0;
	    if (!type) type = 0;

	    if (rate == 0) return -(pv + fv)/nper;

	    var pvif = Math.pow(1 + rate, nper);
	    var pmt = rate / (pvif - 1) * (-(pv * pvif + fv));
	    return pmt;
  	}	

}
