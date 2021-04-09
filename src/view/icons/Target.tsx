import { h } from 'preact';

const Shield = (props: { color: string }): h.JSX.Element => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      fill={props.color}
      stroke={props.color}
    >
      <path d="M0 0h512v512H0z" fill="rgba(0, 0, 0, 0)" fill-opacity="1"></path>
      <g class="" transform="translate(0,0)" style="">
        <path
          d="M138.563 16.063C83.49 42.974 41.459 86.794 16.124 138.53l59.938 29.407c18.988-38.845 50.47-71.807 91.812-92l-29.313-59.874zm234.843.156L344 76.124c38.846 18.99 71.807 50.47 92 91.813l59.875-29.313c-26.913-55.073-70.732-97.073-122.47-122.406zm62.53 327.717c-18.982 38.865-50.53 71.673-91.873 91.875l29.437 60.125c55.116-26.925 97.085-70.76 122.375-122.562l-59.938-29.438zm-359.936.125l-60 29.375c26.928 55.097 70.776 97.082 122.563 122.375l29.406-59.937C129.122 416.885 96.192 385.4 76 344.062z"
          fill={props.color}
          fill-opacity="1"
        ></path>
      </g>
    </svg>
  );
};

export default Shield;
